/**
 * 本機模擬 GET/POST /api/d1/room/:room
 *
 * - round===0 的 data：{ note2, currentPlayerRank, dice: string[] }（dice 為歷史累積）
 * - POST 回合結算：{
 *     room, type, round,
 *     data: { currentPlayerRank, dice: string[] },
 *     list: [{ num, count }]
 *   }
 */
const express = require("express");

const router = express.Router();

/** @type {Map<string, { members: number, currentPlayerRank: number, dice: string[], rounds: any[] }>} */
const store = new Map();

function getRoom(roomId) {
  const id = String(roomId);
  if (!store.has(id)) {
    store.set(id, {
      members: 2,
      currentPlayerRank: 1,
      dice: [],
      rounds: [],
    });
  }
  return store.get(id);
}

function buildResponseRows(roomId) {
  const s = getRoom(roomId);
  const roundZero = {
    id: 0,
    room: roomId,
    round: 0,
    type: null,
    data: {
      note2: s.members,
      currentPlayerRank: s.currentPlayerRank,
      dice: [...s.dice],
    },
    list: [],
  };

  const rest = s.rounds.map((r, i) => ({
    id: i + 1,
    room: roomId,
    round: r.round,
    type: r.type ?? null,
    data: r.data,
    list: Array.isArray(r.list) ? r.list : [],
  }));

  return [roundZero, ...rest];
}

router.get("/:room", (req, res) => {
  try {
    const roomId = req.params.room;
    const m = req.query.members;
    if (m != null && m !== "") {
      const s = getRoom(roomId);
      const n = Number(m);
      if (Number.isFinite(n) && n >= 1) s.members = Math.floor(n);
    }
    res.json(buildResponseRows(roomId));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

router.post("/:room", (req, res) => {
  try {
    const roomId = req.params.room;
    const s = getRoom(roomId);
    const body = req.body || {};

    if (body.action === "setMeta" && body.note2 != null) {
      const n = Number(body.note2);
      if (Number.isFinite(n) && n >= 1) s.members = Math.floor(n);
      return res.json({ ok: true, data: roundZeroPayload(s) });
    }

    if (body.round != null && Number(body.round) !== 0) {
      const round = Number(body.round);
      const bd = body.data;

      let dataPayload;
      if (bd && typeof bd === "object" && !Array.isArray(bd)) {
        dataPayload = {
          currentPlayerRank: Number(bd.currentPlayerRank),
          dice: Array.isArray(bd.dice) ? bd.dice.map(String) : [],
        };
        if (Array.isArray(bd.dice)) {
          for (const d of bd.dice) s.dice.push(String(d));
        }
      } else {
        dataPayload = Number.isFinite(Number(bd)) ? Number(bd) : bd;
      }

      s.rounds.push({
        round,
        type: body.type ?? null,
        data: dataPayload,
        list: Array.isArray(body.list) ? body.list : [],
      });
      const m = s.members || 4;
      s.currentPlayerRank = (round % m) + 1;
      return res.json({ ok: true });
    }

    res.status(400).json({ ok: false, error: "unknown body" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, error: e.message });
  }
});

function roundZeroPayload(s) {
  return {
    note2: s.members,
    currentPlayerRank: s.currentPlayerRank,
    dice: [...s.dice],
  };
}

module.exports = router;
