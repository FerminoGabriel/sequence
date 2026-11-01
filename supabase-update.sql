-- Escolha explícita de personagem; não altera partidas em andamento.
begin;
alter table public.seq_members alter column seat drop not null;
create or replace function public.seq_join_game(p_uid uuid,p_game text) returns uuid language plpgsql security definer set search_path='' as $$
declare r uuid; old_room uuid; st text; s integer;
begin
 if p_game is null or p_game not in ('sequence','phase10') then raise exception 'Jogo inválido.'; end if;
 perform pg_advisory_xact_lock(843921);
 perform public.seq_cleanup();
 select id,status into r,st from public.seq_rooms where game=p_game and number=1 for update;
 if r is null then
  insert into public.seq_rooms(number,game) overriding system value values(1,p_game) returning id,status into r,st;
  insert into public.seq_states(room_id) values(r);
 end if;
 select room_id into old_room from public.seq_members where user_id=p_uid;
 if old_room=r then
  update public.seq_members set last_seen=now(),seat=case when st='waiting' then null else seat end where user_id=p_uid;
  update public.seq_rooms set revision=revision+1,updated_at=now() where id=r;
  return r;
 end if;
 if (select count(*) from public.seq_members where room_id=r)>=4 then
  raise exception 'A sala 1 está cheia. Aguarde uma vaga e toque em Reconectar.';
 end if;
 if st<>'waiting' then
  raise exception 'A sala 1 está em partida. Aguarde a próxima partida e toque em Reconectar.';
 end if;
 if old_room is not null then perform public.seq_leave(p_uid);end if;
 -- Vaga decidida sob bloqueio: entradas simultâneas nunca criam outra sala.
 select i into s from generate_series(0,3) i where not exists(select 1 from public.seq_members m where m.room_id=r and m.seat=i) order by i limit 1;
 insert into public.seq_members(user_id,room_id,seat) values(p_uid,r,null);
 update public.seq_rooms set revision=revision+1,updated_at=now() where id=r;
 return r;
end; $$;

create or replace function public.seq_pick(p_uid uuid,p_seat integer) returns void language plpgsql security definer set search_path='' as $$
declare r uuid; st text;
begin
 if p_seat is null or p_seat not between 0 and 3 then raise exception 'Escolha um personagem válido.'; end if;
 select room_id into r from public.seq_members where user_id=p_uid;
 select status into st from public.seq_rooms where id=r for update;
 if st is distinct from 'waiting' then raise exception 'A partida já começou.'; end if;
 if exists(select 1 from public.seq_members where room_id=r and seat=p_seat and user_id<>p_uid) then raise exception 'Este personagem já foi escolhido.'; end if;
 update public.seq_members set seat=p_seat,last_seen=now() where user_id=p_uid;
 update public.seq_rooms set revision=revision+1,updated_at=now() where id=r;
end; $$;

create or replace function public.seq_commit(p_room uuid,p_revision bigint,p_data jsonb,p_status text,p_due timestamptz) returns boolean language plpgsql security definer set search_path='' as $$
declare current_status text; current_revision bigint;
begin
 select status,revision into current_status,current_revision from public.seq_rooms where id=p_room for update;
 if not found or current_revision<>p_revision then return false; end if;
 if current_status='waiting' and p_status='playing' and exists(select 1 from public.seq_members where room_id=p_room and seat is null) then
  raise exception 'Espere todas as pessoas escolherem um personagem antes de começar.';
 end if;
 update public.seq_rooms set revision=revision+1,status=p_status,updated_at=now() where id=p_room;
 update public.seq_states set data=p_data,due_at=p_due where room_id=p_room;
 return true;
end; $$;

create or replace function public.seq_say(p_uid uuid,p_body text) returns void language plpgsql security definer set search_path='' as $$
declare m public.seq_members; names text[]:=array['Iverson','Ana Paula','Gabriela','Gabriel'];
begin
 select * into m from public.seq_members where user_id=p_uid for update;
 if m.user_id is null then raise exception 'Entre em uma sala primeiro.'; end if;
 if m.seat is null then raise exception 'Escolha seu personagem antes de conversar.'; end if;
 if m.last_message_at>now()-interval '1 second' then raise exception 'Espere um segundo entre mensagens.'; end if;
 if char_length(trim(p_body)) not between 1 and 300 then raise exception 'Escreva entre 1 e 300 caracteres.'; end if;
 update public.seq_members set last_message_at=now() where user_id=p_uid;
 insert into public.seq_chat(room_id,speaker,body) values(m.room_id,names[m.seat+1],trim(p_body));
 delete from public.seq_chat where room_id=m.room_id and id not in(select id from public.seq_chat where room_id=m.room_id order by id desc limit 100);
end; $$;
revoke all on function public.seq_join_game(uuid,text),public.seq_pick(uuid,integer),public.seq_commit(uuid,bigint,jsonb,text,timestamptz),public.seq_say(uuid,text) from public,anon,authenticated;
grant execute on function public.seq_join_game(uuid,text),public.seq_pick(uuid,integer),public.seq_commit(uuid,bigint,jsonb,text,timestamptz),public.seq_say(uuid,text) to service_role;
commit;
