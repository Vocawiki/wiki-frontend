/**
 * 參見{{tl|Moving words}}。
 *
 * 进入代码仓库前的贡献者见 https://voca.wiki/Widget:Moving words?action=history
 */
export default function MovingWords() {
	return (
		<style>{`
@keyframes loading {
  0%, 100% {
	transform: scale(1) rotateZ(0deg);
	opacity: 1;
  }

  26% {
	transform: scale(1.1) rotateZ(12deg);
	opacity: .2;
  }

  76% {
	transform: scale(0.8) rotateZ(-8deg);
	opacity: .6;
  }
}
.loader {
  overflow: hidden;
  font-size: 45px;
}
.loader span {
  animation: loading 1s linear infinite -0.8s;
  display:inline-block;
}
.loader .span2 {
  animation: loading 1s linear infinite -0.2s;
}
.loader .span3 {
  animation: loading 1s linear infinite -0.5s;
}
.loader .span4 {
  animation: loading 1s linear infinite -1.1s;
}
.loader .span5 {
  animation: loading 1s linear infinite -0.36s;
}
.loader .span6 {
  animation: loading 1s linear infinite -0.65s;
}
.loader .span7 {
  animation: loading 1s linear infinite -0.93s;
}
`}</style>
	)
}
