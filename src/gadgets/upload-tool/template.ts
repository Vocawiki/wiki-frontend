export const TEMPLATE = `
<div class="ut-root">
	<div class="ut-toolbar ut-gap">
		<cdx-button type="button" @click="returnToNativeForm">
			<cdx-icon :icon="backIcon"></cdx-icon>
			{{ msg('btn-back-to-native') }}
		</cdx-button>
		<cdx-button type="button" @click="goToBatchUpload">
			<cdx-icon :icon="batchIcon"></cdx-icon>
			{{ msg('btn-batch-upload') }}
		</cdx-button>
		<cdx-button v-if="uploadTextHtml" type="button" weight="quiet" :aria-label="msg('uploadtext-title')" @click="helpOpen = true">
			<cdx-icon :icon="helpIcon"></cdx-icon>
		</cdx-button>
	</div>

	<cdx-message v-if="existingDesc && !isReupload" type="warning" inline class="ut-gap">
		{{ msg('notice-existing-desc') }}
	</cdx-message>

	<div class="ut-layout">
		<div class="ut-main">
		<div class="ut-section">
			<h2 class="ut-title">{{ msg('source-section') }}</h2>
			<div class="ut-radio-row">
				<cdx-radio v-model="sourceType" input-value="File" name="ut-source">{{ msg('source-local') }}</cdx-radio>
				<cdx-radio v-model="sourceType" input-value="url" name="ut-source">{{ msg('source-url') }}</cdx-radio>
			</div>
			<div v-if="sourceType === 'File'" class="ut-drop">
				<div
					class="ut-drop__area"
					role="button"
					tabindex="0"
					@click="chooseFile"
					@keydown.enter="chooseFile"
					@keydown.space.prevent="chooseFile"
				>
					<template v-if="filePreview">
						<img class="ut-drop__preview" :src="filePreview" :alt="fileName" />
						<span class="ut-drop__hint" v-text="fileName + (fileMeta ? ' · ' + fileMeta : '')"></span>
						<cdx-button type="button">
							<cdx-icon :icon="restartIcon"></cdx-icon>
							{{ msg('btn-rechoose-file') }}
						</cdx-button>
					</template>
					<template v-else>
						<cdx-icon class="ut-drop__icon" :icon="uploadIcon"></cdx-icon>
						<cdx-button type="button">{{ msg('btn-choose-file') }}</cdx-button>
						<span class="ut-drop__hint" v-text="msg('preview-file-empty')"></span>
					</template>
				</div>
			</div>
			<template v-else>
				<div class="ut-row2">
					<cdx-text-input name="ut-file-url" v-model="fileUrl" :placeholder="msg('placeholder-file-url')" class="ut-full"></cdx-text-input>
				</div>
				<div v-if="filePreview" class="ut-file-preview ut-gap">
					<img :src="filePreview" alt="" />
				</div>
			</template>
			<cdx-message v-if="allowedTypesHint" type="notice" inline class="ut-gap">
				{{ allowedTypesHint }}
			</cdx-message>
		</div>

		<div class="ut-section">
			<h2 class="ut-title">{{ msg('dest-section') }}</h2>
			<cdx-text-input name="ut-dest-file" v-model="destFile" :disabled="isReupload" :placeholder="msg('placeholder-dest')" class="ut-full"></cdx-text-input>
			<div v-if="destFileExists && !isReupload" class="ut-destfile-warning">
				<cdx-message type="warning" inline>
					<span v-text="msg('dest-exists-prefix')"></span>
					<a :href="destFileUrl" target="_blank" v-text="'File:' + destFile"></a>
				</cdx-message>
				<img v-if="destFileThumb" :src="destFileThumb" :alt="destFile" class="ut-destfile-thumb" />
			</div>
		</div>

		<div class="ut-section" v-if="!isReupload">
			<h2 class="ut-title">{{ msg('desc-section') }}</h2>

			<div class="ut-field-row">
				<div class="ut-sublabel">{{ msg('source-page-label') }}</div>
				<cdx-text-input name="ut-source-page" v-model="sourcePage" :placeholder="msg('placeholder-source-page')" class="ut-full"></cdx-text-input>
			</div>

			<div class="ut-field-row">
				<div class="ut-sublabel">{{ msg('character-label') }}</div>
				<div @keydown.capture="onCharacterLookupKeydown">
					<cdx-multiselect-lookup name="ut-character"
						v-model:input-chips="characterChips"
						v-model:selected="characterSelected"
						v-model:input-value="characterInput"
						:menu-items="characterMenuItems"
						:placeholder="msg('placeholder-character')"
						@focus="ensureObjectOptions"
						@blur="commitCharacterInput"
					>
						<template #no-results>{{ msg('no-results-hint') }}</template>
					</cdx-multiselect-lookup>
				</div>
				<cdx-message v-if="missingCharacterChips.length" type="warning" inline class="ut-gap">
					<span v-text="msg('missing-character-prefix') + missingCharacterText"></span>
				</cdx-message>
			</div>

			<div class="ut-field-row">
				<div class="ut-sublabel">{{ msg('author-label') }}</div>
				<div @keydown.capture="onAuthorLookupKeydown">
					<cdx-multiselect-lookup name="ut-author"
						v-model:input-chips="authorChips"
						v-model:selected="authorSelected"
						v-model:input-value="authorInput"
						:menu-items="authorMenuItems"
						:placeholder="msg('placeholder-author')"
						@blur="commitAuthorInput"
					>
						<template #no-results>{{ msg('no-results-hint') }}</template>
					</cdx-multiselect-lookup>
				</div>
				<cdx-message v-if="missingAuthorChips.length" type="warning" inline class="ut-gap">
					<span v-text="msg('missing-author-prefix') + missingAuthorText"></span>
				</cdx-message>
			</div>

			<div class="ut-field-row">
				<div class="ut-sublabel">{{ msg('function-label') }}</div>
				<div @keydown.capture="onFunctionLookupKeydown">
					<cdx-multiselect-lookup name="ut-function"
						v-model:input-chips="functionChips"
						v-model:selected="functionSelected"
						v-model:input-value="functionInput"
						:menu-items="functionMenuItems"
						:placeholder="msg('placeholder-function')"
						@focus="ensureFunctionOptions"
						@blur="commitFunctionInput"
					>
						<template #no-results>{{ msg('no-results-hint') }}</template>
					</cdx-multiselect-lookup>
				</div>
			</div>
			<cdx-checkbox name="ut-ai-generated" v-model="aiGenerated" class="ut-gap">{{ msg('ai-generated-label') }}</cdx-checkbox>
		</div>

		<div class="ut-section" v-if="!isReupload">
			<h2 class="ut-title">{{ msg('license-section') }}</h2>
			<cdx-select name="ut-license" v-model:selected="license" :menu-items="licenseOptions" :default-label="msg('license-default-label')" class="ut-full"></cdx-select>
			<cdx-message v-if="licenseHint" type="error" inline class="ut-gap">
				<span v-text="licenseHint"></span>
			</cdx-message>
			<div v-for="f in currentLicenseFields" :key="f.key" class="ut-field-row">
				<div class="ut-sublabel" v-text="f.label"></div>
				<cdx-text-input name="ut-license-field" v-if="f.type === 'text'" v-model="licenseFieldValues[f.key]" :placeholder="f.placeholder" class="ut-full"></cdx-text-input>
				<cdx-select name="ut-license-field" v-else v-model:selected="licenseFieldValues[f.key]" :menu-items="f.menuItems" class="ut-full"></cdx-select>
			</div>
			<cdx-checkbox name="ut-trademark" v-model="trademark" class="ut-gap">{{ msg('trademark-label') }}</cdx-checkbox>
			<div v-if="licensePreviewHtml" class="ut-license-preview" v-html="licensePreviewHtml"></div>
			<div v-else-if="licensePreviewLoading" class="ut-license-preview ut-license-loading">{{ msg('license-loading') }}</div>
		</div>

		<div class="ut-section" v-if="!isReupload">
			<h2 class="ut-title">{{ msg('desc-preview-section') }}</h2>
			<textarea id="ut-description-preview" name="ut-description-preview" v-model="previewText" class="ut-preview ut-preview-edit" @input="onPreviewInput"></textarea>
			<div v-if="previewEdited" class="ut-row2">
				<cdx-message type="notice" inline>{{ msg('preview-edited') }}</cdx-message>
				<cdx-button type="button" @click="resetPreview">{{ msg('btn-reset-preview') }}</cdx-button>
			</div>
		</div>

		</div>

		<aside class="ut-side">
			<div class="ut-side-inner">
				<div class="ut-section">
					<h2 class="ut-title">{{ msg('note-section') }}</h2>
					<cdx-text-input name="ut-note" v-model="note" :placeholder="msg('placeholder-note')" class="ut-full"></cdx-text-input>
				</div>
				<div class="ut-section">
					<h2 class="ut-title">{{ msg('options-section') }}</h2>
					<cdx-checkbox name="ut-watch" v-model="watchFile">{{ msg('watch-label') }}</cdx-checkbox>
					<cdx-checkbox name="ut-ignore-warnings" v-model="ignoreWarnings">{{ msg('ignore-warnings-label') }}</cdx-checkbox>
				</div>
				<div class="ut-actions">
					<cdx-button type="button" action="progressive" weight="primary" :disabled="submitting" @click="submit">{{ submitting ? msg('btn-submitting') : msg('btn-submit') }}</cdx-button>
				</div>
			</div>
		</aside>
	</div>

	<cdx-dialog v-model:open="helpOpen" :title="msg('uploadtext-title')" use-close-button>
		<div class="ut-help-content" v-html="uploadTextHtml"></div>
	</cdx-dialog>
</div>
`
