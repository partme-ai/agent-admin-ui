import test from 'node:test';
import assert from 'node:assert/strict';
import colors from '../src/vendor/base_colors/colors.json' with {type:'json'};
import {characterColors,resolveCharacterColor,characterEyeColor} from '../src/character_colors.ts';
test('系统主题保留32种基础色及原10种颜色ID、名称与HEX',()=>{
 assert.equal(characterColors.length,32);assert.deepEqual(characterColors.slice(0,10),colors);
 assert.equal(new Set(characterColors.map(c=>c[0])).size,32);
 for(const c of characterColors)assert.deepEqual(resolveCharacterColor(c[0]),c);
 assert.equal(resolveCharacterColor('#12AbCD')[2],'#12AbCD');
 assert.equal(characterEyeColor('#FFFFFF'),'#202b30');
});
