# 处理lint错误

## 不要为了通过lint而拉屎

lint也可能犯错，不要为了通过lint而增加代码复杂度或降低可读性。**如果你知道你在干什么**，请忽略特定规则，并附上原因。例如：

```ts
// oxlint-disable-next-line unicorn/numeric-separators-style -- 非数量
const REVISION_ID = 188873
```

而不是为了过lint而将ID改为`188_873`——ID不是数量，不应每三位分隔。

## 不要机械地遵循lint的建议

假设有如下代码：

```ts
parentElement.insertBefore(newChild, parentElement.firstChild)
```

lint会报错：

> unicorn(prefer-modern-dom-apis): Prefer using `before` over `insertBefore`.

与其死板地根据错误消息，在不改变运行结果的情况下将`Node#insertBefore()`换为`Element#before()`：

```ts
if (parentElement.firstChild) {
	parentElement.firstChild.before(newChild)
} else {
	parentElement.append(newChild)
}
```

不如思考一下，是否从一开始就设计错了？你本可以使用更直观、简洁的写法：

```ts
parentElement.prepend(newChild)
```
