'use client'

import { Fragment } from 'react'
import { cn } from '@/lib/utils'
import type { BracketData, Match } from '@/lib/types'
import { MatchCard } from './match-card'

interface BracketViewProps {
  data: BracketData
  className?: string
}

function MatchConnectorStub({ isLast }: { isLast: boolean }) {
  if (isLast) return null

  return (
    <div className="absolute right-0 top-1/2 w-6 -translate-y-1/2 hidden sm:block">
      <div className="absolute left-0 top-1/2 h-px w-5 bg-border" />
    </div>
  )
}

function RoundConnectors({
  matchCount,
  roundIndex,
  rowCount,
}: {
  matchCount: number
  roundIndex: number
  rowCount: number
}) {
  const rowHeight = 10
  const pairCount = Math.floor(matchCount / 2)
  const factor = Math.pow(2, roundIndex)
  const containerHeight = rowCount * rowHeight

  return (
    <div
      className="relative shrink-0 w-8 sm:w-10 hidden md:block"
      style={{ height: `${containerHeight}rem` }}
    >
      {Array.from({ length: pairCount }).map((_, pairIndex) => {
        const topCenter = ((4 * pairIndex + 1) * factor - 0.1) * rowHeight
        const bottomCenter = ((4 * pairIndex + 3) * factor - 0.1) * rowHeight
        const segmentHeight = bottomCenter - topCenter

        return (
          <div
            key={pairIndex}
            className="absolute left-0"
            style={{
              top: `${topCenter}rem`,
              height: `${segmentHeight}rem`,
            }}
          >
            <div className="absolute left-0 top-0 h-px w-3 bg-border" />
            <div className="absolute left-3 top-0 h-full w-px bg-border" />
            <div className="absolute left-3 top-[calc(50%-1px)] h-px w-7 bg-border" />
          </div>
        )
      })}
    </div>
  )
}

function RoundColumn({
  name,
  matches,
  roundIndex,
  totalRounds,
  rowCount,
}: {
  name: string
  matches: Match[]
  roundIndex: number
  totalRounds: number
  rowCount: number
}) {
  const isLastRound = roundIndex === totalRounds - 1
  const rowHeight = '10rem'

  const getGridRow = (matchIndex: number) => {
    return (2 * matchIndex + 1) * Math.pow(2, roundIndex)
  }

  return (
    <div className="flex flex-col shrink-0 min-w-[240px] sm:min-w-[280px]">
      
      {/* HEADER */}
      <div className="mb-3 text-center">
        <h3 className="text-sm font-semibold text-foreground">
          {name}
        </h3>
        <p className="text-xs text-muted-foreground">
          {matches.length} matches
        </p>
      </div>

      {/* MATCHES */}
      <div
        className="grid"
        style={{
          gridTemplateRows: `repeat(${rowCount}, minmax(${rowHeight}, auto))`,
          minHeight: `calc(${rowCount} * ${rowHeight})`,
        }}
      >
        {matches.map((match, i) => (
          <div
            key={match.id}
            className="relative pr-6 sm:pr-10 flex items-center"
            style={{
              gridRowStart: getGridRow(i),
              gridRowEnd: `span 1`,
            }}
          >
            <MatchCard match={match} compact className="w-52 sm:w-56" />

            <MatchConnectorStub isLast={isLastRound} />
          </div>
        ))}
      </div>
    </div>
  )
}

export function BracketView({ data, className }: BracketViewProps) {
  const { rounds } = data
  const rowCount = Math.max(1, rounds[0]?.matches.length * 2 - 1)

  return (
    <div className={cn('w-full overflow-x-auto pb-4', className)}>
      
      {/* MOBILE SCROLL IMPROVED */}
      <div className="flex min-w-max items-start gap-0 px-2 sm:px-0">
        
        {rounds.map((round, roundIndex) => (
          <Fragment key={round.round}>
            <RoundColumn
              name={round.name}
              matches={round.matches}
              roundIndex={roundIndex}
              totalRounds={rounds.length}
              rowCount={rowCount}
            />

            {roundIndex < rounds.length - 1 && (
              <RoundConnectors
                matchCount={round.matches.length}
                roundIndex={roundIndex}
                rowCount={rowCount}
              />
            )}
          </Fragment>
        ))}
      </div>
    </div>
  )
}