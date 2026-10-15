// Phase 0 only: proves Noto Serif SC and pinyin tone marks render. Removed once real screens exist.
export default function FontCheck() {
  return (
    <div className="fontcheck" aria-label="Font check">
      <p className="hanzi-sample">你好 谢谢 学生 中国</p>
      <p className="pinyin-sample">nǐ hǎo · xièxie · xuésheng · Zhōngguó</p>
      <p className="pinyin-sample">ā á ǎ à ē é ě è ī í ǐ ì ō ó ǒ ò ū ú ǔ ù ǖ ǘ ǚ ǜ</p>
    </div>
  )
}
