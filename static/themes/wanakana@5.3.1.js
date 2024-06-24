!function(e,t){"object"==typeof exports&&"undefined"!=typeof module?t(exports):"function"==typeof define&&define.amd?define(["exports"],t):t((e="undefined"!=typeof globalThis?globalThis:e||self).wanakana={})}(this,(function(e){"use strict";function t(e){return null===e?"null":e!==Object(e)?typeof e:{}.toString.call(e).slice(8,-1).toLowerCase()}function n(e){return"string"!==t(e)||!e.length}function r(){let e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:"",t=arguments.length>1?arguments[1]:void 0,r=arguments.length>2?arguments[2]:void 0;if(n(e))return!1;const o=e.charCodeAt(0);return t<=o&&o<=r}const o={HIRAGANA:"toHiragana",KATAKANA:"toKatakana"},i={HEPBURN:"hepburn"},a={useObsoleteKana:!1,passRomaji:!1,convertLongVowelMark:!0,upcaseKatakana:!1,IMEMode:!1,romanization:i.HEPBURN},u=65,s=90,c=12353,l=12438,f=12449,d=12540,h=19968,g=40879,v=12293,p=12540,m=12539,b=[65313,65338],j=[65345,65370],y=[65377,65381],E=[[12288,12351],y,[12539,12540],[65281,65295],[65306,65311],[65339,65343],[65371,65376],[65504,65518]],A=[...[[12352,12447],[12448,12543],y,[65382,65439]],...E,b,j,[65296,65305],[19968,40959],[13312,19903]],O=[[0,127],[256,257],[274,275],[298,299],[332,333],[362,363]],N=[[32,47],[58,63],[91,96],[123,126],[8216,8217],[8220,8221]];function w(){let e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:"";return A.some((t=>{let[n,o]=t;return r(e,n,o)}))}function k(){let e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:"",r=arguments.length>1?arguments[1]:void 0;const o="regexp"===t(r);return!n(e)&&[...e].every((e=>{const t=w(e);return o?t||r.test(e):t}))}var M=Number.isNaN||function(e){return"number"==typeof e&&e!=e};function S(e,t){if(e.length!==t.length)return!1;for(var n=0;n<e.length;n++)if(r=e[n],o=t[n],!(r===o||M(r)&&M(o)))return!1;var r,o;return!0}function C(e,t){void 0===t&&(t=S);var n=null;function r(){for(var r=[],o=0;o<arguments.length;o++)r[o]=arguments[o];if(n&&n.lastThis===this&&t(r,n.lastArgs))return n.lastResult;var i=e.apply(this,r);return n={lastResult:i,lastArgs:r,lastThis:this},i}return r.clear=function(){n=null},r}var K=Object.prototype.hasOwnProperty;function R(e,t,n){for(n of e.keys())if(J(n,t))return n}function J(e,t){var n,r,o;if(e===t)return!0;if(e&&t&&(n=e.constructor)===t.constructor){if(n===Date)return e.getTime()===t.getTime();if(n===RegExp)return e.toString()===t.toString();if(n===Array){if((r=e.length)===t.length)for(;r--&&J(e[r],t[r]););return-1===r}if(n===Set){if(e.size!==t.size)return!1;for(r of e){if((o=r)&&"object"==typeof o&&!(o=R(t,o)))return!1;if(!t.has(o))return!1}return!0}if(n===Map){if(e.size!==t.size)return!1;for(r of e){if((o=r[0])&&"object"==typeof o&&!(o=R(t,o)))return!1;if(!J(r[1],t.get(o)))return!1}return!0}if(n===ArrayBuffer)e=new Uint8Array(e),t=new Uint8Array(t);else if(n===DataView){if((r=e.byteLength)===t.byteLength)for(;r--&&e.getInt8(r)===t.getInt8(r););return-1===r}if(ArrayBuffer.isView(e)){if((r=e.byteLength)===t.byteLength)for(;r--&&e[r]===t[r];);return-1===r}if(!n||"object"==typeof e){for(n in r=0,e){if(K.call(e,n)&&++r&&!K.call(t,n))return!1;if(!(n in t)||!J(e[n],t[n]))return!1}return Object.keys(t).length===r}}return e!=e&&t!=t}const z=function(){let e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{};return Object.assign({},a,e)};function I(e,t,n){const r=t;function o(e,t){const n=e.charAt(0);return i(Object.assign({"":n},r[n]),e.slice(1),t,t+1)}function i(e,t,r,a){if(!t)return n||1===Object.keys(e).length?e[""]?[[r,a,e[""]]]:[]:[[r,a,null]];if(1===Object.keys(e).length)return[[r,a,e[""]]].concat(o(t,a));const u=function(e,t){if(void 0!==e[t])return Object.assign({"":e[""]+t},e[t])}(e,t.charAt(0));return void 0===u?[[r,a,e[""]]].concat(o(t,a)):i(u,t.slice(1),r,a+1)}return o(e,0)}function L(e){return Object.entries(e).reduce(((e,n)=>{let[r,o]=n;const i="string"===t(o);return e[r]=i?{"":o}:L(o),e}),{})}function T(e,t){return t.split("").reduce(((e,t)=>(void 0===e[t]&&(e[t]={}),e[t])),e)}function H(){let e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{};const n={};return"object"===t(e)&&Object.entries(e).forEach((e=>{let[t,r]=e,o=n;t.split("").forEach((e=>{void 0===o[e]&&(o[e]={}),o=o[e]})),o[""]=r})),function(e){return function e(n,r){return void 0===n||"string"===t(n)?r:Object.entries(r).reduce(((t,r)=>{let[o,i]=r;return t[o]=e(n[o],i),t}),n)}(JSON.parse(JSON.stringify(e)),n)}}function U(e,n){return n?"function"===t(n)?n(e):H(n)(e):e}const $={a:"あ",i:"い",u:"う",e:"え",o:"お",k:{a:"か",i:"き",u:"く",e:"け",o:"こ"},s:{a:"さ",i:"し",u:"す",e:"せ",o:"そ"},t:{a:"た",i:"ち",u:"つ",e:"て",o:"と"},n:{a:"な",i:"に",u:"ぬ",e:"ね",o:"の"},h:{a:"は",i:"ひ",u:"ふ",e:"へ",o:"ほ"},m:{a:"ま",i:"み",u:"む",e:"め",o:"も"},y:{a:"や",u:"ゆ",o:"よ"},r:{a:"ら",i:"り",u:"る",e:"れ",o:"ろ"},w:{a:"わ",i:"ゐ",e:"ゑ",o:"を"},g:{a:"が",i:"ぎ",u:"ぐ",e:"げ",o:"ご"},z:{a:"ざ",i:"じ",u:"ず",e:"ぜ",o:"ぞ"},d:{a:"だ",i:"ぢ",u:"づ",e:"で",o:"ど"},b:{a:"ば",i:"び",u:"ぶ",e:"べ",o:"ぼ"},p:{a:"ぱ",i:"ぴ",u:"ぷ",e:"ぺ",o:"ぽ"},v:{a:"ゔぁ",i:"ゔぃ",u:"ゔ",e:"ゔぇ",o:"ゔぉ"}},x={".":"。",",":"、",":":"：","/":"・","!":"！","?":"？","~":"〜","-":"ー","‘":"「","’":"」","“":"『","”":"』","[":"［","]":"］","(":"（",")":"）","{":"｛","}":"｝"},P={k:"き",s:"し",t:"ち",n:"に",h:"ひ",m:"み",r:"り",g:"ぎ",z:"じ",d:"ぢ",b:"び",p:"ぴ",v:"ゔ",q:"く",f:"ふ"},_={ya:"ゃ",yi:"ぃ",yu:"ゅ",ye:"ぇ",yo:"ょ"},D={a:"ぁ",i:"ぃ",u:"ぅ",e:"ぇ",o:"ぉ"},q={sh:"sy",ch:"ty",cy:"ty",chy:"ty",shy:"sy",j:"zy",jy:"zy",shi:"si",chi:"ti",tsu:"tu",ji:"zi",fu:"hu"},B=Object.assign({tu:"っ",wa:"ゎ",ka:"ヵ",ke:"ヶ"},D,_),V={yi:"い",wu:"う",ye:"いぇ",wi:"うぃ",we:"うぇ",kwa:"くぁ",whu:"う",tha:"てゃ",thu:"てゅ",tho:"てょ",dha:"でゃ",dhu:"でゅ",dho:"でょ"},G={wh:"う",kw:"く",qw:"く",q:"く",gw:"ぐ",sw:"す",ts:"つ",th:"て",tw:"と",dh:"で",dw:"ど",fw:"ふ",f:"ふ"};function W(){const e=L($),t=t=>T(e,t);function n(e){return Object.entries(e).reduce(((e,t)=>{let[r,o]=t;return e[r]=r?n(o):`っ${o}`,e}),{})}return Object.entries(P).forEach((e=>{let[n,r]=e;Object.entries(_).forEach((e=>{let[o,i]=e;t(n+o)[""]=r+i}))})),Object.entries(x).forEach((e=>{let[n,r]=e;t(n)[""]=r})),Object.entries(G).forEach((e=>{let[n,r]=e;Object.entries(D).forEach((e=>{let[o,i]=e;t(n+o)[""]=r+i}))})),["n","n'","xn"].forEach((e=>{t(e)[""]="ん"})),e.c=JSON.parse(JSON.stringify(e.k)),Object.entries(q).forEach((e=>{let[n,r]=e;const o=n.slice(0,n.length-1),i=n.charAt(n.length-1);t(o)[i]=JSON.parse(JSON.stringify(t(r)))})),Object.entries(B).forEach((e=>{let[n,r]=e;const o=e=>e.charAt(e.length-1),i=e=>e.slice(0,e.length-1),a=t(`x${n}`);a[""]=r;var u;t(`l${i(n)}`)[o(n)]=a,(u=n,[...Object.entries(q),["c","k"]].reduce(((e,t)=>{let[n,r]=t;return u.startsWith(r)?e.concat(u.replace(r,n)):e}),[])).forEach((e=>{["l","x"].forEach((r=>{t(r+i(e))[o(e)]=t(r+n)}))}))})),Object.entries(V).forEach((e=>{let[n,r]=e;t(n)[""]=r})),[...Object.keys(P),"c","y","w","j"].forEach((t=>{const r=e[t];r[t]=n(r)})),delete e.n.n,Object.freeze(JSON.parse(JSON.stringify(e)))}let X=null;const Z=H({wi:"ゐ",we:"ゑ"});function F(){let e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:"";return!n(e)&&r(e,u,s)}function Q(){let e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:"";return!n(e)&&e.charCodeAt(0)===p}function Y(){let e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:"";return!n(e)&&e.charCodeAt(0)===m}function ee(){let e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:"";return!n(e)&&(!!Q(e)||r(e,c,l))}function te(){const e=[];return(arguments.length>0&&void 0!==arguments[0]?arguments[0]:"").split("").forEach((t=>{if(Q(t)||Y(t))e.push(t);else if(ee(t)){const n=t.charCodeAt(0)+(f-c),r=String.fromCharCode(n);e.push(r)}else e.push(t)})),e.join("")}const ne=C(((e,t,n)=>{let r=(null==X&&(X=W()),X);return r=e?function(e){const t=JSON.parse(JSON.stringify(e));return t.n.n={"":"ん"},t.n[" "]={"":"ん"},t}(r):r,r=t?Z(r):r,n&&(r=U(r,n)),r}),J);function re(){let e,t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:"",n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{},r=arguments.length>2?arguments[2]:void 0;return r?e=n:(e=z(n),r=ne(e.IMEMode,e.useObsoleteKana,e.customKanaMapping)),function(){let e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:"",t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{},n=arguments.length>2?arguments[2]:void 0;const{IMEMode:r,useObsoleteKana:o,customKanaMapping:i}=t;n||(n=ne(r,o,i));return I(e.toLowerCase(),n,!r)}(t,e,r).map((n=>{const[r,i,a]=n;if(null===a)return t.slice(r);const u=e.IMEMode===o.HIRAGANA,s=e.IMEMode===o.KATAKANA||[...t.slice(r,i)].every(F);return u||!s?a:te(a)})).join("")}let oe=[];function ie(e){const t=Object.assign({},z(e),{IMEMode:e.IMEMode||!0}),n=ne(t.IMEMode,t.useObsoleteKana,t.customKanaMapping),r=[...Object.keys(n),...Object.keys(n).map((e=>e.toUpperCase()))];return function(e){let{target:o}=e;undefined!==o.value&&"true"!==o.dataset.ignoreComposition&&function(e,t,n,r,o){const[i,a,u]=function(){let e,t,n,r=arguments.length>0&&void 0!==arguments[0]?arguments[0]:"",o=arguments.length>1&&void 0!==arguments[1]?arguments[1]:0,i=arguments.length>2&&void 0!==arguments[2]?arguments[2]:[];0===o&&i.includes(r[0])?[e,t,n]=function(e,t){return["",...ue(e,(e=>t.includes(e)||!k(e,/[0-9]/)))]}(r,i):o>0?[e,t,n]=function(){let e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:"",t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:0;const[n,r]=ue([...e.slice(0,t)].reverse(),(e=>!k(e)));return[r.reverse().join(""),n.split("").reverse().join(""),e.slice(t)]}(r,o):([e,t]=ue(r,(e=>!i.includes(e))),[t,n]=ue(t,(e=>!k(e))));return[e,t,n]}(e.value,e.selectionEnd,r),s=re(a,t,n);if(a!==s){const t=i.length+s.length,n=i+s+u;e.value=n,u.length?setTimeout((()=>e.setSelectionRange(t,t)),1):e.setSelectionRange(t,t)}else e.value}(o,t,n,r)}}function ae(e){let{type:t,target:n,data:r}=e;/Mac/.test(window.navigator&&window.navigator.platform)&&("compositionupdate"===t&&k(r)&&(n.dataset.ignoreComposition="true"),"compositionend"===t&&(n.dataset.ignoreComposition="false"))}function ue(){let e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:e=>!!e;const n=[],{length:r}=e;let o=0;for(;o<r&&t(e[o],o);)n.push(e[o]),o+=1;return[n.join(""),e.slice(o)]}const se={input:e=>{let{target:{value:t,selectionStart:n,selectionEnd:r}}=e;return console.log("input:",{value:t,selectionStart:n,selectionEnd:r})},compositionstart:()=>console.log("compositionstart"),compositionupdate:e=>{let{target:{value:t,selectionStart:n,selectionEnd:r},data:o}=e;return console.log("compositionupdate",{data:o,value:t,selectionStart:n,selectionEnd:r})},compositionend:()=>console.log("compositionend")},ce=["TEXTAREA","INPUT"];let le=0;function fe(){let e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:"";return!n(e)&&O.some((t=>{let[n,o]=t;return r(e,n,o)}))}function de(){let e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:"",r=arguments.length>1?arguments[1]:void 0;const o="regexp"===t(r);return!n(e)&&[...e].every((e=>{const t=fe(e);return o?t||r.test(e):t}))}function he(){return r(arguments.length>0&&void 0!==arguments[0]?arguments[0]:"",f,d)}function ge(){let e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:"";return!n(e)&&(ee(e)||he(e))}function ve(){let e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:"";return!n(e)&&[...e].every(ge)}function pe(){let e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:"";return!n(e)&&[...e].every(ee)}function me(){let e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:"";return!n(e)&&[...e].every(he)}function be(){let e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:"";return!n(e)&&e.charCodeAt(0)===v}function je(){let e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:"";return r(e,h,g)||be(e)}function ye(){let e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:"";return!n(e)&&[...e].every(je)}function Ee(){const e=[...arguments.length>0&&void 0!==arguments[0]?arguments[0]:""];let t=!1;return(arguments.length>1&&void 0!==arguments[1]?arguments[1]:{passKanji:!0}).passKanji||(t=e.some(ye)),(e.some(pe)||e.some(me))&&e.some(de)&&!t}const Ae=(e,t)=>Q(e)&&t<1,Oe=(e,t)=>Q(e)&&t>0,Ne=e=>["ヶ","ヵ"].includes(e),we={a:"あ",i:"い",u:"う",e:"え",o:"う"};function ke(){let e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:"",t=arguments.length>1?arguments[1]:void 0,{isDestinationRomaji:n,convertLongVowelMark:r}=arguments.length>2&&void 0!==arguments[2]?arguments[2]:{},o="";return e.split("").reduce(((i,a,u)=>{if(Y(a)||Ae(a,u)||Ne(a))return i.concat(a);if(r&&o&&Oe(a,u)){const r=t(o).slice(-1);return he(e[u-1])&&"o"===r&&n?i.concat("お"):i.concat(we[r])}if(!Q(a)&&he(a)){const e=a.charCodeAt(0)+(c-f),t=String.fromCharCode(e);return o=t,i.concat(t)}return o="",i.concat(a)}),[]).join("")}let Me=null;const Se={"あ":"a","い":"i","う":"u","え":"e","お":"o","か":"ka","き":"ki","く":"ku","け":"ke","こ":"ko","さ":"sa","し":"shi","す":"su","せ":"se","そ":"so","た":"ta","ち":"chi","つ":"tsu","て":"te","と":"to","な":"na","に":"ni","ぬ":"nu","ね":"ne","の":"no","は":"ha","ひ":"hi","ふ":"fu","へ":"he","ほ":"ho","ま":"ma","み":"mi","む":"mu","め":"me","も":"mo","ら":"ra","り":"ri","る":"ru","れ":"re","ろ":"ro","や":"ya","ゆ":"yu","よ":"yo","わ":"wa","ゐ":"wi","ゑ":"we","を":"wo","ん":"n","が":"ga","ぎ":"gi","ぐ":"gu","げ":"ge","ご":"go","ざ":"za","じ":"ji","ず":"zu","ぜ":"ze","ぞ":"zo","だ":"da","ぢ":"ji","づ":"zu","で":"de","ど":"do","ば":"ba","び":"bi","ぶ":"bu","べ":"be","ぼ":"bo","ぱ":"pa","ぴ":"pi","ぷ":"pu","ぺ":"pe","ぽ":"po","ゔぁ":"va","ゔぃ":"vi","ゔ":"vu","ゔぇ":"ve","ゔぉ":"vo"},Ce={"。":".","、":",","：":":","・":"/","！":"!","？":"?","〜":"~","ー":"-","「":"‘","」":"’","『":"“","』":"”","［":"[","］":"]","（":"(","）":")","｛":"{","｝":"}","　":" "},Ke=["あ","い","う","え","お","や","ゆ","よ"],Re={"ゃ":"ya","ゅ":"yu","ょ":"yo"},Je={"ぃ":"yi","ぇ":"ye"},ze={"ぁ":"a","ぃ":"i","ぅ":"u","ぇ":"e","ぉ":"o"},Ie=["き","に","ひ","み","り","ぎ","び","ぴ","ゔ","く","ふ"],Le={"し":"sh","ち":"ch","じ":"j","ぢ":"j"},Te={"っ":"","ゃ":"ya","ゅ":"yu","ょ":"yo","ぁ":"a","ぃ":"i","ぅ":"u","ぇ":"e","ぉ":"o"},He={b:"b",c:"t",d:"d",f:"f",g:"g",h:"h",j:"j",k:"k",m:"m",p:"p",q:"q",r:"r",s:"s",t:"t",v:"v",w:"w",x:"x",z:"z"};function Ue(){return null==Me&&(Me=function(){const e=L(Se),t=t=>T(e,t),n=(e,n)=>{t(e)[""]=n};return Object.entries(Ce).forEach((e=>{let[n,r]=e;t(n)[""]=r})),[...Object.entries(Re),...Object.entries(ze)].forEach((e=>{let[t,r]=e;n(t,r)})),Ie.forEach((e=>{const r=t(e)[""][0];Object.entries(Re).forEach((t=>{let[o,i]=t;n(e+o,r+i)})),Object.entries(Je).forEach((t=>{let[o,i]=t;n(e+o,r+i)}))})),Object.entries(Le).forEach((e=>{let[t,r]=e;Object.entries(Re).forEach((e=>{let[o,i]=e;n(t+o,r+i[1])})),n(`${t}ぃ`,`${r}yi`),n(`${t}ぇ`,`${r}e`)})),e["っ"]=$e(e),Object.entries(Te).forEach((e=>{let[t,r]=e;n(t,r)})),Ke.forEach((e=>{n(`ん${e}`,`n'${t(e)[""]}`)})),Object.freeze(JSON.parse(JSON.stringify(e)))}()),Me}function $e(e){return Object.entries(e).reduce(((e,t)=>{let[n,r]=t;if(n)e[n]=$e(r);else{const t=r.charAt(0);e[n]=Object.keys(He).includes(t)?He[t]+r:r}return e}),{})}const xe=C(((e,t)=>{let n=function(e){return e===i.HEPBURN?Ue():{}}(e);return t&&(n=U(n,t)),n}),J);function Pe(){let e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:"",t=arguments.length>2?arguments[2]:void 0;const n=z(arguments.length>1&&void 0!==arguments[1]?arguments[1]:{});return t||(t=xe(n.romanization,n.customRomajiMapping)),function(e,t,n){n||(n=xe(t.romanization,t.customRomajiMapping));const r=Object.assign({},{isDestinationRomaji:!0},t);return I(ke(e,Pe,r),n,!t.IMEMode)}(e,n,t).map((t=>{const[r,o,i]=t;return n.upcaseKatakana&&me(e.slice(r,o))?i.toUpperCase():i})).join("")}function _e(){let e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:"";return!n(e)&&N.some((t=>{let[n,o]=t;return r(e,n,o)}))}function De(){let e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:"";return!n(e)&&!be(e)&&E.some((t=>{let[n,o]=t;return r(e,n,o)}))}const qe=e=>" "===e,Be=e=>"　"===e,Ve=e=>/[０-９]/.test(e),Ge=e=>/[0-9]/.test(e),We={EN:"en",JA:"ja",EN_NUM:"englishNumeral",JA_NUM:"japaneseNumeral",EN_PUNC:"englishPunctuation",JA_PUNC:"japanesePunctuation",KANJI:"kanji",HIRAGANA:"hiragana",KATAKANA:"katakana",SPACE:"space",OTHER:"other"};function Xe(e){let t=arguments.length>1&&void 0!==arguments[1]&&arguments[1];const{EN:n,JA:r,EN_NUM:o,JA_NUM:i,EN_PUNC:a,JA_PUNC:u,KANJI:s,HIRAGANA:c,KATAKANA:l,SPACE:f,OTHER:d}=We;if(t)switch(!0){case Ve(e):case Ge(e):return d;case qe(e):return n;case _e(e):return d;case Be(e):return r;case De(e):return d;case w(e):return r;case fe(e):return n;default:return d}else switch(!0){case Be(e):case qe(e):return f;case Ve(e):return i;case Ge(e):return o;case _e(e):return a;case De(e):return u;case je(e):return s;case ee(e):return c;case he(e):return l;case w(e):return r;case fe(e):return n;default:return d}}function Ze(e){let{compact:t=!1,detailed:r=!1}=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};if(null==e||n(e))return[];const o=[...e];let i=o.shift(),a=Xe(i,t);i=r?{type:a,value:i}:i;return o.reduce(((e,n)=>{const o=Xe(n,t),i=o===a;a=o;let u=n;return i&&(u=(r?e.pop().value:e.pop())+u),r?e.concat({type:o,value:u}):e.concat(u)}),[i])}e.ROMANIZATIONS=i,e.TO_KANA_METHODS=o,e.VERSION="5.3.1",e.bind=function(){let e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{},n=arguments.length>2&&void 0!==arguments[2]&&arguments[2];if(!ce.includes(e.nodeName))throw new Error(`Element provided to Wanakana bind() was not a valid input or textarea element.\n Received: (${JSON.stringify(e)})`);if(e.hasAttribute("data-wanakana-id"))return;const r=ie(t),o=(le+=1,`${Date.now()}${le}`),i={};var a;[{name:"data-wanakana-id",value:o},{name:"lang",value:"ja"},{name:"autoCapitalize",value:"none"},{name:"autoCorrect",value:"off"},{name:"autoComplete",value:"off"},{name:"spellCheck",value:"false"}].forEach((t=>{i[t.name]=e.getAttribute(t.name),e.setAttribute(t.name,t.value)})),e.dataset.previousAttributes=JSON.stringify(i),e.addEventListener("input",r),e.addEventListener("compositionupdate",ae),e.addEventListener("compositionend",ae),function(e,t,n){oe=oe.concat({id:e,inputHandler:t,compositionHandler:n})}(o,r,ae),!0===n&&(a=e,Object.entries(se).forEach((e=>{let[t,n]=e;return a.addEventListener(t,n)})))},e.isHiragana=pe,e.isJapanese=k,e.isKana=ve,e.isKanji=ye,e.isKatakana=me,e.isMixed=Ee,e.isRomaji=de,e.stripOkurigana=function(){let e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:"",{leading:t=!1,matchKanji:n=""}=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};if(!k(e)||((e,t)=>t&&!ve(e[0]))(e,t)||((e,t)=>!t&&!ve(e[e.length-1]))(e,t)||((e,t)=>t&&![...t].some(ye)||!t&&ve(e))(e,n))return e;const r=n||e,o=new RegExp(t?`^${Ze(r).shift()}`:`${Ze(r).pop()}$`);return e.replace(o,"")},e.toHiragana=function(){let e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:"";const t=z(arguments.length>1&&void 0!==arguments[1]?arguments[1]:{});if(t.passRomaji)return ke(e,Pe,t);if(Ee(e,{passKanji:!0})){return re(ke(e,Pe,t).toLowerCase(),t)}return de(e)||_e(e)?re(e.toLowerCase(),t):ke(e,Pe,t)},e.toKana=re,e.toKatakana=function(){let e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:"";const t=z(arguments.length>1&&void 0!==arguments[1]?arguments[1]:{});if(t.passRomaji)return te(e);if(Ee(e)||de(e)||_e(e)){return te(re(e.toLowerCase(),t))}return te(e)},e.toRomaji=Pe,e.tokenize=Ze,e.unbind=function(e){let t=arguments.length>1&&void 0!==arguments[1]&&arguments[1];const n=(r=e)&&oe.find((e=>{let{id:t}=e;return t===r.getAttribute("data-wanakana-id")}));var r;if(null==n)throw new Error(`Element provided to Wanakana unbind() had no listener registered.\n Received: ${JSON.stringify(e)}`);const{inputHandler:o,compositionHandler:i}=n,a=JSON.parse(e.dataset.previousAttributes);var u;Object.keys(a).forEach((t=>{a[t]?e.setAttribute(t,a[t]):e.removeAttribute(t)})),e.removeAttribute("data-previous-attributes"),e.removeAttribute("data-ignore-composition"),e.removeEventListener("input",o),e.removeEventListener("compositionstart",i),e.removeEventListener("compositionupdate",i),e.removeEventListener("compositionend",i),function(e){let{id:t}=e;oe=oe.filter((e=>{let{id:n}=e;return n!==t}))}(n),!0===t&&(u=e,Object.entries(se).forEach((e=>{let[t,n]=e;return u.removeEventListener(t,n)})))}}));
//# sourceMappingURL=wanakana.min.js.map
