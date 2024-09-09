import { IStageData } from './interfaces';
import { sushiContractAddress, sushiModuleName } from '../../core/dexes/sushi/sushiData';
import { SushiConfig, SyncSwapConfig } from '../../config';
import { syncSwapModuleName, syncSwapRouterContractAddress } from '../../core/dexes/syncswap/syncswapData';

export const stagesData: IStageData[] = [
    {
        moduleName: sushiModuleName,
        spenderContractAddress: sushiContractAddress,
        ethValue: { range: SushiConfig.ethSwapRange.range, fixed: SushiConfig.ethSwapRange.fixed },
        stableValue: { range: SushiConfig.stableSwapRange.range, fixed: SushiConfig.stableSwapRange.fixed },
    },
    {
        moduleName: syncSwapModuleName,
        spenderContractAddress: syncSwapRouterContractAddress,
        ethValue: { range: SyncSwapConfig.ethSwapRange.range, fixed: SyncSwapConfig.ethSwapRange.fixed },
        stableValue: { range: SyncSwapConfig.stableSwapRange.range, fixed: SyncSwapConfig.stableSwapRange.fixed },
    },
];
