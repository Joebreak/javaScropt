import React from "react";
import { colorForPlayerRank } from "./playerColors";
import "./DiceHistoryList.css";

/**
 * entries: { rank: number, roll: string }[]（rank 為該回合 currentPlayerRank）
 */
export default function DiceHistoryList({ entries }) {
  const list = Array.isArray(entries) ? entries : [];
  if (list.length === 0) {
    return (
      <div className="cannotStop-dice-history cannotStop-dice-history--empty">
        <div className="cannotStop-dice-history__title">擲骰紀錄</div>
        <p className="cannotStop-dice-history__empty">
          尚無紀錄（停下存檔後會從 API 回合資料顯示）
        </p>
      </div>
    );
  }

  return (
    <div className="cannotStop-dice-history">
      <div className="cannotStop-dice-history__title">擲骰紀錄（新→舊）</div>
      <div className="cannotStop-dice-history__scroll">
        <ol className="cannotStop-dice-history__list">
        {list.map((entry, i) => {
          const row =
            entry && typeof entry === "object" && "roll" in entry
              ? entry
              : { rank: NaN, roll: String(entry) };
          const { rank, roll } = row;
          const bg = colorForPlayerRank(rank);
          /** 與列表逆序一致：最上（最新）= #N，最下（最舊）= #1 */
          const n = list.length - i;
          return (
            <li
              key={`${i}-${String(roll)}`}
              className="cannotStop-dice-history__item"
            >
              <span className="cannotStop-dice-history__idx">#{n}</span>
              <span className="cannotStop-dice-history__player">
                <span
                  className="cannotStop-dice-history__swatch"
                  style={{ background: bg }}
                  aria-hidden
                />
                <span
                  className="cannotStop-dice-history__player-label"
                  style={{ color: bg }}
                >
                  {Number.isFinite(rank) && rank >= 1
                    ? `玩家 ${rank}`
                    : "—"}
                </span>
              </span>
              <span className="cannotStop-dice-history__value">{roll}</span>
            </li>
          );
        })}
        </ol>
      </div>
    </div>
  );
}
