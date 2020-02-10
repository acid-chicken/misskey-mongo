import Vue from 'vue';

export default (opts) => ({
	data() {
		return {
			items: [],
			offset: 0,
			fetching: true,
			moreFetching: false,
			inited: false,
			more: false,
			backed: false,
		};
	},

	computed: {
		empty(): boolean {
			return this.items.length == 0 && !this.fetching && this.inited;
		},

		error(): boolean {
			return !this.fetching && !this.inited;
		},
	},

	watch: {
		pagination() {
			this.init();
		}
	},

	created() {
		opts.displayLimit = opts.displayLimit || 30;
		this.init();
	},

	methods: {
		isScrollTop() {
			return window.scrollY <= 8;
		},

		updateItem(i, item) {
			Vue.set((this as any).items, i, item);
		},

		reload() {
			this.items = [];
			this.init();
		},

		async init() {
			this.fetching = true;
			if (opts.before) opts.before(this);
			let params = typeof this.pagination.params === 'function' ? this.pagination.params(true) : this.pagination.params;
			if (params && params.then) params = await params;
			const endpoint = typeof this.pagination.endpoint === 'function' ? this.pagination.endpoint() : this.pagination.endpoint;
			await this.$root.api(endpoint, {
				limit: this.pagination.noPaging ? (this.pagination.limit || 10) : (this.pagination.limit || 10) + 1,
				...params
			}).then(x => {
				if (!this.pagination.noPaging && (x.length === (this.pagination.limit || 10) + 1)) {
					x.pop();
					this.items = x;
					this.more = true;
				} else {
					this.items = x;
					this.more = false;
				}
				this.offset = x.length;
				this.inited = true;
				this.fetching = false;
				if (opts.after) opts.after(this, null);
			}, e => {
				this.fetching = false;
				if (opts.after) opts.after(this, e);
			});
		},

		async fetchMore() {
			if (!this.more || this.moreFetching || this.items.length === 0) return;
			this.moreFetching = true;
			this.backed = true;
			let params = typeof this.pagination.params === 'function' ? this.pagination.params(false) : this.pagination.params;
			if (params && params.then) params = await params;
			const endpoint = typeof this.pagination.endpoint === 'function' ? this.pagination.endpoint() : this.pagination.endpoint;
			await this.$root.api(endpoint, {
				limit: (this.pagination.limit || 10) + 1,
				...(this.pagination.offsetMode ? {
					offset: this.offset,
				} : {
					untilId: this.items[this.items.length - 1].id,
				}),
				...params
			}).then(x => {
				if (x.length === (this.pagination.limit || 10) + 1) {
					x.pop();
					this.items = this.items.concat(x);
					this.more = true;
				} else {
					this.items = this.items.concat(x);
					this.more = false;
				}
				this.offset += x.length;
				this.moreFetching = false;
			}, e => {
				this.moreFetching = false;
			});
		},

		prepend(item, silent = false) {
			if (opts.onPrepend) {
				const cancel = opts.onPrepend(this, item, silent);
				if (cancel) return;
			}

			// Prepend the item
			this.items.unshift(item);

			if (this.isScrollTop()) {
				// オーバーフローしたら古い投稿は捨てる
				if (this.items.length >= opts.displayLimit) {
					this.items = this.items.slice(0, opts.displayLimit);
					this.more = true;
				}
			}
		},

		append(item) {
			this.items.push(item);
		},

		remove(find) {
			this.items = this.items.filter(x => !find(x));
		},
	}
});
