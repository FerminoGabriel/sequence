# Jogar sem internet

1. Em cada aparelho, abra https://ferminogabriel.github.io/sequence/ com internet.
2. Se aparecer uma atualização, toque em **Atualizar**. Aguarde a mensagem de jogos preparados para abrir sem internet. Instalar o app é recomendado.
3. Use **Offline · bots** para jogar sozinho. Sequence e Phase 10 funcionam sem Supabase; partidas ficam salvas no próprio navegador.

## Amigos próximos, de 2 a 4 pessoas

1. Conectem os aparelhos ao mesmo Wi-Fi ou hotspot. A rede não precisa ter internet.
2. Todos abrem **Amigos próximos** e escolhem o mesmo jogo.
3. Uma pessoa toca em **Criar mesa próxima**, escolhe seu personagem e toca em **Convidar amigo**.
4. O amigo toca em **Entrar por convite → Ler QR Code**, lendo o convite mostrado no aparelho que criou a mesa.
5. O amigo verá um QR Code de resposta. Quem criou a mesa lê essa resposta no campo **Ler QR Code** de seu convite.
6. Quando conectar, cada pessoa escolhe um personagem disponível. Repitam o convite para os demais amigos. Quem criou a mesa inicia a partida; bots preenchem as vagas livres.

Se preferirem, expandam **Copiar código manualmente** e colem o código no outro aparelho, sem usar a câmera. Cada convite serve para um aparelho.

O aparelho que cria a mesa coordena cartas e bots. Mantenha-o aberto e desbloqueado. Se um convidado sair, um bot assume. Ele pode voltar por um novo convite e escolher seu antigo personagem, caso livre. Se o criador fechar o app, a mesa desconecta; a partida fica salva nele para retomar e convidar novamente.

O chat de texto, efeitos e conversas dos personagens continuam disponíveis. A voz da sala on-line usa internet e não faz parte da mesa próxima. Música permanece desativada.

## Limites da rede e do navegador

O pareamento usa WebRTC com candidatos locais e sem STUN, TURN ou servidor de sinalização. Algumas redes de convidados, roteadores e hotspots isolam os aparelhos; nessas redes a conexão pode não completar. Não é uma conexão Bluetooth. O app precisa ter sido preparado previamente em cada aparelho; limpar os dados do navegador ou a remoção automática do cache pode exigir novo acesso com internet.

As bibliotecas de QR Code, leitura e compactação ficam no cache do app, com suas licenças em `vendor/`.
