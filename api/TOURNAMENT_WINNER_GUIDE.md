# Guia: Sistema de Vencedor de Torneio

## Visão Geral

Foi implementado um sistema completo para determinar e registrar o vencedor de um torneio, com dois métodos diferentes:

### 1. **Finalização Automática** (`finishTournament`)

Analisa os matches finalizados no bracket e calcula automaticamente o vencedor e rankings.

#### Fluxo:
1. Encontra o match final (última rodada) do bracket
2. Verifica se o match foi finalizado
3. Conta wins/losses de cada participante
4. Classifica participantes por performance
5. Marca o vencedor com status `WINNER` e posição 1
6. Marca os eliminados com status `ELIMINATED` e posições 2+
7. Atualiza stats dos usuários (wins/losses)
8. Muda status do torneio para `FINISHED`

**Uso:**
```bash
POST /tournament/:tournamentId/finish
Authorization: Bearer {token}
```

**Requisitos:**
- Torneio deve estar `ONGOING`
- Todos os matches devem estar `FINISHED`
- Usuário deve ser organizador ou admin

---

### 2. **Declaração Manual** (`declareWinner`)

Permite ao organizador declarar manualmente o vencedor quando o bracket não está completo ou em situações especiais.

#### Fluxo:
1. Valida se o participante é um membro do torneio
2. Define o participante como `WINNER` com posição 1
3. Define todos os outros como `ELIMINATED`
4. Atualiza stats do usuário
5. Finaliza o torneio

**Uso:**
```bash
POST /tournament/:tournamentId/declare-winner/:winnerId
Authorization: Bearer {token}
```

**Requisitos:**
- Torneio deve estar `ONGOING`
- `winnerId` deve ser um participante registrado
- Usuário deve ser organizador ou admin

---

## Estrutura de Dados Afetada

### Modelo: `TournamentParticipant`

```prisma
model TournamentParticipant {
  id            String @id
  tournamentId  String
  userId        String
  status        ParticipantStatus  // REGISTERED → WINNER ou ELIMINATED
  finalPosition Int?               // 1 = vencedor, 2+ = ranking
  
  // ... outros campos
}
```

### Modelo: `Tournament`

Campos atualizados:
- `status`: `ONGOING` → `FINISHED`
- `endDate`: Data/hora em que o torneio foi finalizado

### Modelo: `User`

Campos atualizados:
- `wins`: Incrementado se usuário venceu
- `losses`: Incrementado se usuário não venceu

---

## Exemplo de Resposta

Após finalizar o torneio, a resposta inclui os participantes ordenados por posição:

```json
{
  "id": "tournament-123",
  "title": "Grand Tournament 2026",
  "status": "FINISHED",
  "endDate": "2026-05-26T10:30:00Z",
  "participants": [
    {
      "id": "participant-1",
      "userId": "user-winner",
      "status": "WINNER",
      "finalPosition": 1,
      "user": { "id": "user-winner", "username": "ProPlayer" }
    },
    {
      "id": "participant-2",
      "userId": "user-2",
      "status": "ELIMINATED",
      "finalPosition": 2,
      "user": { "id": "user-2", "username": "Player2" }
    },
    {
      "id": "participant-3",
      "userId": "user-3",
      "status": "ELIMINATED",
      "finalPosition": 3,
      "user": { "id": "user-3", "username": "Player3" }
    },
    {
      "id": "participant-4",
      "userId": "user-4",
      "status": "ELIMINATED",
      "finalPosition": 4,
      "user": { "id": "user-4", "username": "Player4" }
    }
  ]
}
```

---

## Casos de Uso

### Caso 1: Torneio Single Elimination Completo
1. Todos os matches foram finalizados
2. Chamar `POST /tournament/:id/finish`
3. O vencedor é determinar automaticamente

### Caso 2: Disqualificação/Saída de Jogador
1. Um jogador foi desclassificado e o torneio está pausado
2. Chamar `POST /tournament/:id/declare-winner/:winnerId` com o ID do vencedor
3. O torneio é finalizado manualmente

### Caso 3: Torneio Round-Robin
1. Após todas as partidas serem jogadas
2. Chamar `POST /tournament/:id/finish`
3. Ranking é calculado automaticamente por wins/losses

---

## Validações

✅ Apenas organizador ou admin podem finalizar
✅ Torneio deve estar em status ONGOING
✅ Para auto-finish: match final deve estar FINISHED
✅ Para declare-winner: participante deve estar registrado
✅ Stats de usuários são atualizados automaticamente

---

## Próximas Melhorias Sugeridas

1. **Distribuição de Prêmios**: Integrar com `TournamentReward` para distribuir prêmios baseado em `finalPosition`
2. **Notificações**: Enviar notificações aos participantes quando o torneio termina
3. **Badges/Achievements**: Atualizar achievements do usuário baseado em ranking
4. **Gráficos**: Adicionar histórico de resultados para estatísticas
