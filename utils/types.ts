type UUID = string;

export type DevelopmentCardType =
    | "KNIGHT"
    | "MONOPOLY"
    | "ROAD_BUILDING"
    | "INVENTION"
    | "VICTORY_POINT";

export type Player = {
    "playerId": UUID,
    "name": string,
    "color": "BLUE" | "RED" | "WHITE" | "ORANGE",
    "victoryPoints": number,
    "resourceCards": {
        "WOOD": number,
        "BRICK": number,
        "WOOL": number,
        "WHEAT": number,
        "ORE": number
    },
    "developmentCards": Record<DevelopmentCardType, number>
    "newDevelopmentCards": Partial<Record<DevelopmentCardType, number>>
    "devCardPlayedThisTurn": boolean,
    "pieces": {
        "settlementsPlaced": number,
        "citiesPlaced": number,
        "roadsPlaced": number,
    },
    "achievements": {
        "hasLongestRoad": boolean,
        "longestRoadLength": number,
        "hasLargestArmy": boolean,
        "armySize": number,
    },
    "portsOwned": {
        "type": "WOOD" | "BRICK" | "WOOL" | "WHEAT" | "ORE" | "THREE_TO_ONE";
        "ratio": "2:1" | "3:1";
    }[];
    "turnState": {
        "currentPhase": "SETUP" | "ROLL" | "BUFFER" | "TRADE" | "BUILD" | "END"
    }
}

export type GameState = {
    "gameId": string,
    "status": "SETUP" | "IN_PROGRESS" | "FINISHED",
    "players": Player[], // in queue
    "phase": "SETUP_1" | "SETUP_2" | "BUFFER" | "ROLL" | "TRADE" | "BUILD" | "ROAD_BUILDING" | "END",
    "dice": {
        "sum": number
    },
    "bank": {
        "resources": {
            "WOOD": number,
            "BRICK": number,
            "WOOL": number,
            "WHEAT": number,
            "ORE": number
        },
        "developmentCardsRemaining": number
    },
    "developmentDeck": {
        "KNIGHT": number,
        "MONOPOLY": number,
        "ROAD_BUILDING": number,
        "INVENTION": number,
        "VICTORY_POINT": number
    },
    "tradeState": {
        "Trades": {
            "player1": UUID,
            "player2": UUID,
            "Resources": {
                "WOOD": number,
                "BRICK": number,
                "WOOL": number,
                "WHEAT": number,
                "ORE": number
            },
            "isActive": boolean,
            "Accepted": boolean,
        }[]
    },
    "pendingFreeRoads": number,
    "largestArmyPlayerId"?: string,
    "winner": {
        "playerId": UUID,
    }
}
