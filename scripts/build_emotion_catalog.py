import json,pathlib
root=pathlib.Path(__file__).resolve().parents[1]
d=json.load(open(root/'reference/console/emoji-catalog-18.0.json'))
exclude={'🤖','💩','🤡','👹','👺','👻','👽','👾','🙂‍↔️','🙂‍↕️','🫡','🤠','🥸','🫯','💨','🕳️','💬','👁️‍🗨️','🗨️','💭'}
# 明确映射每一个标准情绪；同一组共享轮廓原语，而非以ID随机生成眼睛。
groups='''
😀 😃 😄 😁 😆 😅 🤣 😂 🙂 🙃 🫠 🫫 😉 😊 😇 | 喜悦 | smile laugh none
🥰 😍 🤩 😘 😗 ☺️ 😚 😙 🥲 | 爱与亲近 | heart smile hearts
😋 😛 😜 🤪 😝 🤑 | 俏皮 | open tongue none
🤗 🤭 🫢 🫣 🤫 🤔 | 含蓄与思索 | open flat think
🤐 🤨 😐 😑 😶 🫥 😶‍🌫️ 😏 😒 🙄 😬 😮‍💨 🤥 🫨 | 平静与复杂 | sleepy flat none
😌 😔 😪 🤤 😴 🫩 🥱 | 疲倦与安定 | closed flat sleep
😷 🤒 🤕 🤢 🤮 🤧 🥵 🥶 🥴 😵 😵‍💫 🤯 | 不适与眩晕 | sad wavy sick
🥳 😎 🤓 🧐 | 自信与庆祝 | smile smile sparkle
😕 🫤 😟 🙁 ☹️ 😮 😯 😲 😳 🫪 🥺 🥹 😦 😧 😨 😰 😥 😢 😭 😱 😖 😣 😞 😓 😩 😫 | 忧伤与惊惧 | sad frown none
😤 😡 😠 🤬 😈 👿 💀 ☠️ | 愤怒与强烈感受 | angry frown anger
😺 😸 😹 😻 😼 😽 🙀 😿 😾 | 猫脸情绪 | smile smile none
🙈 🙉 🙊 | 含蓄与思索 | open flat none
💌 💘 💝 💖 💗 💓 💞 💕 💟 ❣️ 💔 ❤️‍🔥 ❤️‍🩹 ❤️ 🩷 🧡 💛 💚 💙 🩵 💜 🤎 🖤 🩶 🤍 💋 | 爱与亲近 | heart smile hearts
💯 💢 💥 💫 💦 🗯️ 💤 | 情绪符号 | open flat none
'''
mapping={}
for line in groups.strip().splitlines():
 emojis,cat,style=[s.strip() for s in line.split('|')]
 for emoji in emojis.split():mapping[emoji]=(cat,style.split())
overrides={}
def over(chars,**kw):
 for c in chars.split():overrides.setdefault(c,{}).update(kw)
over('😀',left='open',right='open');over('😃',left='wide',right='wide');over('😄',intensity=1.1);over('😁',mouth='teeth');over('😆',left='closed',right='closed');over('😅',effect='sweat');over('🤣',effect='tears',tilt=-14);over('😂 😹',effect='tears');over('🙂 ☺️',mouth='smile',intensity=.65);over('🙃',tilt=180,mouth='smile');over('🫠',effect='melt',mouth='smile');over('🫫',effect='crack',mouth='wavy');over('😉 😜',left='wink',right='open');over('😊 ☺️ 😚 😳',effect='blush');over('😇',effect='halo',mouth='smile');over('😍 😻',left='heart',right='heart');over('🤩',left='star',right='star',effect='sparkle');over('😘 😗 😚 😙 😽 💋',mouth='kiss');over('😗',left='open',right='open',effect='none');over('😚',left='closed',right='closed');over('😙',left='smile',right='smile');over('🥲',left='smile',right='smile',effect='tear');over('😋',left='smile',right='smile');over('🤪',left='wide',right='closed',tilt=-9);over('😝',left='closed',right='closed');over('🤑',effect='money');over('🤗',left='smile',right='smile',effect='hug',mouth='smile');over('🤭 🫢 🙊',effect='cover-mouth');over('🤭',left='smile',right='smile');over('🫢',left='wide',right='wide');over('🫣 🙈',effect='cover-eyes');over('🤫',effect='shush');over('🤨',left='angry',right='wide',effect='brow');over('🤐',mouth='zip',effect='none');over('😐',left='open',right='open');over('😑',left='closed',right='closed');over('😶 🫥 😶‍🌫️',mouth='none');over('🫥',effect='dotted');over('😶‍🌫️',effect='cloud');over('😏 😼',mouth='smile',tilt=-6);over('😒',left='sad',right='sad');over('🙄',left='rolling',right='rolling');over('😬',mouth='teeth');over('😮‍💨',mouth='open',effect='sigh');over('🤥',effect='nose');over('🫨',effect='shake',left='wide',right='wide',mouth='open');over('😌',mouth='smile',effect='none');over('😔',mouth='frown',effect='none');over('😪',effect='sweat');over('🤤',effect='tear',mouth='smile');over('🫩',left='sleepy',right='sleepy',effect='bags');over('🥱',mouth='open');over('😷',effect='mask');over('🤒',effect='thermometer');over('🤕',effect='bandage');over('🤢',effect='sick');over('🤮',effect='vomit',mouth='open');over('🤧',effect='sneeze',left='closed',right='closed');over('🥵',effect='hot',mouth='tongue');over('🥶',effect='cold',mouth='teeth');over('🥴',left='open',right='closed',tilt=9);over('😵',left='cross',right='cross');over('😵‍💫 💫',left='spiral',right='spiral',effect='stars');over('🤯',effect='explosion',left='wide',right='wide',mouth='open');over('🥳',effect='party');over('😎',effect='glasses');over('🤓',effect='nerd',mouth='teeth',left='open',right='open');over('🧐',effect='monocle',left='open',right='wide');over('🫤',mouth='diagonal');over('🙁',intensity=.7);over('☹️',intensity=1.2);over('😮 😯 😲 😦 😧 😨 😱 🙀',mouth='open');over('😮',left='open',right='open');over('😯',left='wide',right='open');over('😲 😱 🙀',left='wide',right='wide');over('🫪',effect='distort',left='wide',right='closed',mouth='wavy');over('🥺 🥹',left='wide',right='wide',effect='tear');over('🥹',mouth='smile');over('😰 😥 😓 💦',effect='sweat');over('😢 😿',effect='tear');over('😭',effect='tears',mouth='open',left='closed',right='closed');over('😱',effect='fear');over('😖 😣 😫',left='cross',right='cross');over('😩',mouth='open');over('😤',effect='steam');over('🤬 🗯️',effect='swear',mouth='zip');over('😈 👿',effect='horns');over('😈',mouth='smile');over('💀 ☠️',effect='skull',left='cross',right='cross',mouth='teeth');over('☠️',effect='crossbones');over('😺',left='open',right='open',mouth='laugh');over('😸',mouth='laugh');over('😽',left='closed',right='closed');over('😿',left='sad',right='sad',mouth='frown');over('😾',left='angry',right='angry',mouth='frown');over('🙉',effect='cover-ears');over('💯',effect='hundred',left='star',right='star',mouth='smile');over('💢',effect='anger',left='angry',right='angry',mouth='frown');over('💥',effect='explosion',left='wide',right='wide',mouth='open');over('💤',effect='sleep',left='closed',right='closed');
colors={'🩷':'#f49abe','🧡':'#fb923c','💛':'#f4d45b','💚':'#69bc8a','💙':'#5d8fe0','🩵':'#8bd7e7','💜':'#a583df','🤎':'#ad8265','🖤':'#55545e','🩶':'#a4acb3','🤍':'#f5f1e6'}
heart_effects=dict(zip('💌 💘 💝 💖 💗 💓 💞 💕 💟 ❣️ 💔 ❤️‍🔥 ❤️‍🩹'.split(),['letter','arrow','ribbon','sparkle-heart','growing-heart','beat-heart','orbit-heart','two-hearts','heart-tile','heart-mark','broken-heart','fire-heart','heal-heart']))
entries=[];excluded=[]
for e in d['entries']:
 if e['group']!='Smileys & Emotion':continue
 if e['emoji'] in exclude:
  excluded.append({'id':e['id'],'emoji':e['emoji'],'name':e['name_zh'],'reason':'身份或动作，不作为情绪配方' if e['subgroup']!='emotion' else '物体、动作或对话界面符号'});continue
 emoji=e['emoji'];cat,style=mapping[emoji]
 recipe=dict(left=style[0],right=style[0],mouth=style[1],effect=style[2],motif='cat' if e['subgroup']=='cat-face' else 'monkey' if e['subgroup']=='monkey-face' else 'heart' if e['subgroup']=='heart' else 'face',accent=colors.get(emoji,'#ef86a2'),intensity=1,tempo=1,tilt=0)
 recipe.update(overrides.get(emoji,{}))
 if emoji in heart_effects:recipe['effect']=heart_effects[emoji]
 entries.append(dict(id=e['id'],emoji=emoji,name=e['name_zh'],name_en=e['name_en'],keywords=e['keywords_zh'],category=cat,recipe=recipe))
assert len(entries)==152 and len(excluded)==20
out={'unicode_version':'18.0','cldr_version':'49','source':'https://unicode.org/Public/emoji/latest/emoji-test.txt','source_sha256':'8f3735cda1f92a779d78af67cf86066bb1f07143dc22f2ac29394d9bc57ab21a','scope':'TinyBot product emotion and affect selection; not an official Unicode emotion taxonomy','entries':entries,'excluded':excluded}
p=root/'src/emotion_catalog.json';p.write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n')
