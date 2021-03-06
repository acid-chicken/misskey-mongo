<template>
<x-popup :source="source" ref="popup" @closed="() => { $emit('closed'); destroyDom(); }">
	<div class="omfetrab">
		<header>
			<button v-for="category in categories"
				class="_button"
				:title="category.text"
				@click="go(category)"
				:class="{ active: category.isActive }"
				:key="category.text"
			>
				<fa :icon="category.icon" fixed-width/>
			</button>
		</header>

		<div class="emojis">
			<template v-if="categories[0].isActive">
				<header class="category"><fa :icon="faHistory" fixed-width/> {{ $t('recentUsedEmojis') }}</header>
				<div class="list">
					<button v-for="(emoji, i) in ($store.state.device.recentEmojis || [])"
						class="_button"
						:title="emoji.name"
						@click="chosen(emoji)"
						:key="i"
					>
						<mk-emoji v-if="emoji.char != null" :emoji="emoji.char"/>
						<img v-else :src="$store.state.device.disableShowingAnimatedImages ? getStaticImageUrl(emoji.url) : emoji.url"/>
					</button>
				</div>
			</template>

			<header class="category"><fa :icon="categories.find(x => x.isActive).icon" fixed-width/> {{ categories.find(x => x.isActive).text }}</header>
			<template v-if="categories.find(x => x.isActive).name">
				<div class="list">
					<button v-for="emoji in emojilist.filter(e => e.category === categories.find(x => x.isActive).name)"
						class="_button"
						:title="emoji.name"
						@click="chosen(emoji)"
						:key="emoji.name"
					>
						<mk-emoji :emoji="emoji.char"/>
					</button>
				</div>
			</template>
			<template v-else>
				<div v-for="(key, i) in Object.keys(customEmojis)" :key="i">
					<header class="sub" v-if="key">{{ key }}</header>
					<div class="list">
						<button v-for="emoji in customEmojis[key]"
							class="_button"
							:title="emoji.name"
							@click="chosen(emoji)"
							:key="emoji.name"
						>
							<img :src="$store.state.device.disableShowingAnimatedImages ? getStaticImageUrl(emoji.url) : emoji.url"/>
						</button>
					</div>
				</div>
			</template>
		</div>
	</div>
</x-popup>
</template>

<script lang="ts">
import Vue from 'vue';
import i18n from '../i18n';
import { emojilist } from '../../misc/emojilist';
import { getStaticImageUrl } from '../scripts/get-static-image-url';
import { faAsterisk, faLeaf, faUtensils, faFutbol, faCity, faDice, faGlobe, faHistory } from '@fortawesome/free-solid-svg-icons';
import { faHeart, faFlag, faLaugh } from '@fortawesome/free-regular-svg-icons';
import { groupByX } from '../../prelude/array';
import XPopup from './popup.vue';

export default Vue.extend({
	i18n,

	components: {
		XPopup,
	},

	props: {
		source: {
			required: true
		},
	},

	data() {
		return {
			emojilist,
			getStaticImageUrl,
			customEmojis: {},
			faGlobe, faHistory,
			categories: [{
				text: this.$t('customEmoji'),
				icon: faAsterisk,
				isActive: true
			}, {
				name: 'people',
				text: this.$t('people'),
				icon: faLaugh,
				isActive: false
			}, {
				name: 'animals_and_nature',
				text: this.$t('animals-and-nature'),
				icon: faLeaf,
				isActive: false
			}, {
				name: 'food_and_drink',
				text: this.$t('food-and-drink'),
				icon: faUtensils,
				isActive: false
			}, {
				name: 'activity',
				text: this.$t('activity'),
				icon: faFutbol,
				isActive: false
			}, {
				name: 'travel_and_places',
				text: this.$t('travel-and-places'),
				icon: faCity,
				isActive: false
			}, {
				name: 'objects',
				text: this.$t('objects'),
				icon: faDice,
				isActive: false
			}, {
				name: 'symbols',
				text: this.$t('symbols'),
				icon: faHeart,
				isActive: false
			}, {
				name: 'flags',
				text: this.$t('flags'),
				icon: faFlag,
				isActive: false
			}]
		};
	},

	created() {
		let local = this.$store.state.instance.meta.emojis;
		local = groupByX(local, (x: any) => x.category || '');
		this.customEmojis = local;
	},

	methods: {
		go(category: any) {
			this.goCategory(category.name);
		},

		goCategory(name: string) {
			let matched = false;
			for (const c of this.categories) {
				c.isActive = c.name === name;
				if (c.isActive) {
					matched = true;
				}
			}
			if (!matched) {
				this.categories[0].isActive = true;
			}
		},

		chosen(emoji: any) {
			const getKey = (emoji: any) => emoji.char || `:${emoji.name}:`;
			let recents = this.$store.state.device.recentEmojis || [];
			recents = recents.filter((e: any) => getKey(e) !== getKey(emoji));
			recents.unshift(emoji)
			this.$store.commit('device/set', { key: 'recentEmojis', value: recents.splice(0, 16) });
			this.$emit('chosen', getKey(emoji));
		},

		close() {
			this.$refs.popup.close();
		}
	}
});
</script>

<style lang="scss" scoped>
.omfetrab {
	width: 350px;

	> header {
		display: flex;

		> button {
			flex: 1;
			padding: 10px 0;
			font-size: 16px;
			transition: color 0.2s ease;

			&:hover {
				color: var(--textHighlighted);
				transition: color 0s;
			}

			&.active {
				color: var(--accent);
				transition: color 0s;
			}
		}
	}

	> .emojis {
		height: 300px;
		overflow-y: auto;
		overflow-x: hidden;

		> header.category {
			position: sticky;
			top: 0;
			left: 0;
			z-index: 1;
			padding: 8px;
			background: var(--panel);
			font-size: 12px;
		}

		header.sub {
			padding: 4px 8px;
			font-size: 12px;
		}

		div.list {
			display: grid;
			grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr;
			gap: 4px;
			padding: 8px;

			> button {
				position: relative;
				padding: 0;
				width: 100%;

				&:before {
					content: '';
					display: block;
					width: 1px;
					height: 0;
					padding-bottom: 100%;
				}

				&:hover {
					> * {
						transform: scale(1.2);
						transition: transform 0s;
					}
				}

				> * {
					position: absolute;
					top: 0;
					left: 0;
					width: 100%;
					height: 100%;
					object-fit: contain;
					font-size: 28px;
					transition: transform 0.2s ease;
					pointer-events: none;
				}
			}
		}
	}
}
</style>
