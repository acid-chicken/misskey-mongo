<template>
<section class="_card">
	<div class="_title">{{ $t('_auth.shareAccess', { name: app.name }) }}</div>
	<div class="_content">
		<h2>{{ app.name }}</h2>
		<p class="id">{{ app.id }}</p>
		<p class="description">{{ app.description }}</p>
	</div>
	<div class="_content">
		<h2>{{ $t('_auth.permissionAsk') }}</h2>
		<ul>
			<template v-for="p in app.permission">
				<li :key="p">{{ $t(`_permissions.${p}`) }}</li>
			</template>
		</ul>
	</div>
	<div class="_footer">
		<mk-button @click="cancel" inline>{{ $t('cancel') }}</mk-button>
		<mk-button @click="accept" inline primary>{{ $t('accept') }}</mk-button>
	</div>
</section>
</template>

<script lang="ts">
import Vue from 'vue';
import i18n from '../i18n';
import MkButton from '../components/ui/button.vue';

export default Vue.extend({
	i18n,
	components: {
		MkButton
	},
	props: ['session'],
	computed: {
		name(): string {
			const el = document.createElement('div');
			el.textContent = this.app.name
			return el.innerHTML;
		},
		app(): any {
			return this.session.app;
		}
	},
	methods: {
		cancel() {
			this.$root.api('auth/deny', {
				token: this.session.token
			}).then(() => {
				this.$emit('denied');
			});
		},

		accept() {
			this.$root.api('auth/accept', {
				token: this.session.token
			}).then(() => {
				this.$emit('accepted');
			});
		}
	}
});
</script>
