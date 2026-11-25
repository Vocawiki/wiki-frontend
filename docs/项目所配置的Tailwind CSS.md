# 项目所配置的Tailwind CSS

项目在[src/theme.css](../src/theme.css)定义了`@theme`、`@custom-variant`、`@utility`等，介绍如下。

## Theme

相较于默认配置，本项目有以下不同之处：

- 字体（`--font-*`）：只有`main`（主要字体）和`mono`（等宽字体），没有`sans`、`serif`等。
- 圆角（`--radius-*`）：有`xs`、`sm`、`sm`、`md`、`lg`，均随皮肤而变；`full`（纯圆，不随皮肤变化）、`max`（皮肤允许的最大圆角半径——在有些皮肤中这是一个直角，在有些皮肤中则是纯圆）、`container`（靠外层容器的圆角半径）。
- 响应式断点（`--breakpoint-*`）：新增了`codex-mobile`、`codex-tablet`、`codex-desktop`、`codex-desktop-wide`，仅用于和MediaWiki皮肤的特定功能保持同步（如判断该皮肤的侧边栏是否折叠了），一般不应使用。

### 技术细节

对于某些主题变量，不同皮肤需要采用不同值。为了实现该功能，同时减少构建后的无用代码，并保留IDE扩展的预览、补全能力，本项目采用如下方法：

1. 在`@theme`中将这些变量定义为`var(--skin-specific)`占位符。
2. 在皮肤的CSS中另行定义真实值。
3. 构建时去掉占位符。

例如：

```css
/* theme.css */
@theme {
	--radius-max: var(--skin-specific);
}

/* vector.css */
@layer theme {
	:root,
	:host {
		--radius-max: 2px;
	}
}

/* citizen.css */
@layer theme {
	:root,
	:host {
		--radius-max: var(--radius-full);
	}
}
```

构建时，移除`theme.css`中的`--radius-max: var(--skin-specific);`。

## Variants

### 深色、浅色模式：`dark:`、`not-dark:`

用户可以通过皮肤选项切换深浅色模式或令其跟随系统，因此请使用项目定义的variant，不要自己写媒体查询。

> [!WARNING]
>
> 为了减小文件体积，`dark:`、`not-dark:`只匹配`:root`的后代，`:root`本身不会被匹配。若要匹配它，请使用`root-dark:`、`root-not-dark:`。

### 文章区域宽度：`main-<size>:`、`main-not-<size>:`

类似Tailwind CSS自带的`sm:`、`md:`等，不过反映的是文章区域（`#mw-content-text`）的宽度。

创建文章区域内的响应式外观时，请优先使用这些变体而非基于视口宽度的变体。这是因为：

- 即使视口宽度相同，不同皮肤上的内容区域宽度也并不一致；
- 就算在同一皮肤上，侧边栏的展开/折叠等状态也会影响内容区域的宽度。

| Variant     | 文章区域宽度      |
| ----------- | ----------------- |
| `main-2xs:` | ≥ 448px（28rem）  |
| `main-xs:`  | ≥ 512px（32rem）  |
| `main-sm:`  | ≥ 640px（40rem）  |
| `main-md:`  | ≥ 768px（48rem）  |
| `main-lg:`  | ≥ 1024px（64rem） |
| `main-xl:`  | ≥ 1280px（80rem） |
| `main-2xl:` | ≥ 1536px（96rem） |

`main-not-<size>:`则把上面的“≥”换成“&lt;”。通常你不应该使用Tailwind CSS自动生成的`not-main-<size>:`，因为它们会匹配文章区域外的所有元素，而`main-not-<size>`只会匹配文章区域内的元素。

## Utilities

| Utility                | 功能                                                                              | 等价CSS/utilities                  |
| ---------------------- | --------------------------------------------------------------------------------- | ---------------------------------- |
| `fill`                 | 填充最近的定位祖先元素                                                            | `absolute inset-0`                 |
| `visually-hidden`      | 用于替代`sr-only`，请始终使用`visually-hidden`而非`sr-only`                       | `sr-only`                          |
| `image-pixelated`      | 使图像以适合像素画的方式渲染                                                      | `image-rendering: pixelated`       |
| `image-rendering-auto` | 恢复图像默认渲染方式                                                              | `image-rendering: auto`            |
| `flex-center`          | 令子元素纵横居中                                                                  | `flex items-center justify-center` |
| `auto-interact-fx`     | 自动添加悬停、点击时的效果（基于`filter`）。建议专门设计交互效果而非依赖此utility | 略                                 |
