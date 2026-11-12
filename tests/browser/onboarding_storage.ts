// 只读验收面板：不控制界面，不写浏览器存储，不展示已保存配置的值。
import {onboardingKey} from '../../src/onboarding.ts';
const snapshot=()=>Object.fromEntries(Object.keys(localStorage).filter(key=>key!==onboardingKey).sort().map(key=>[key,localStorage.getItem(key)]));
const before=snapshot(),output=document.createElement('pre');document.body.append(output);
function report(){const after=snapshot(),changedKeys=[...new Set([...Object.keys(before),...Object.keys(after)])].filter(key=>before[key]!==after[key]);output.textContent=JSON.stringify({savedConfigurationKeys:Object.keys(before).length,unchanged:changedKeys.length===0,changedKeys,onboardingUsesSeparateKey:localStorage.getItem(onboardingKey)!==null},null,2);}
report();addEventListener('storage',report);
