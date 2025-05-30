import gc from "@sg/game-client-base";
import { LogStore } from "db://shared-components/game/scripts/stores/log-store";

import { sharedContainer } from "../../scripts/shared-container";
import { BlackjackFeatures } from "db://blackjack-shared-components/index";

const GAME_NAME = "Blackjack";
export const settings = {
    id: 25,
    name: GAME_NAME,
    observerNamespace: GAME_NAME,
    namespaces: [GAME_NAME],
    durations: {} as any,
    numberOfRoundHistory: 0,
};

export const containerOptions: gc.IContainerOptions = {
    globalContainer: sharedContainer,
    onContainerCreated: (container) => {
        container.bind(gc.GameConfigs.GameSetting).toConstantValue(settings);
        container.bind(LogStore).to(LogStore);
    },
    features: [gc.BetDetailsNew, ...gc.defaultFeatures, BlackjackFeatures],
};
