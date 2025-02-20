import { defineComponent } from 'vue';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronLeftDoubleIcon,
  ChevronRightDoubleIcon,
  EllipsisIcon,
} from 'tdesign-icons-vue-next';
import config from '../config';
import mixins from '../utils/mixins';
import getConfigReceiverMixins, { PaginationConfig } from '../config-provider/config-receiver';
import TInput from '../input';
import { Select, Option } from '../select';
import CLASSNAMES from '../utils/classnames';
import props from './props';
import { TdPaginationProps } from './type';
import { ClassName } from '../common';
import { renderTNodeJSX } from '../utils/render-tnode';
import { emitEvent } from '../utils/event';

const { prefix } = config;

const name = `${prefix}-pagination`;
const min = 1;

const PaginationLocalReceiver = getConfigReceiverMixins<PaginationConfig>('pagination');

export default defineComponent({
  name: 'TPagination',
  components: {
    ChevronLeftIcon,
    ChevronRightIcon,
    ChevronLeftDoubleIcon,
    ChevronRightDoubleIcon,
    EllipsisIcon,
    TInput,
    TSelect: Select,
    TOption: Option,
  },
  ...mixins(PaginationLocalReceiver),
  props: {
    ...props,
    /**
     * 当前页
     */
    current: {
      type: Number,
      default: 1,
      validator(v: number): boolean {
        return v > 0;
      },
    },
    /**
     * 分页大小
     */
    pageSize: {
      type: Number,
      default: 10,
      validator(v: number): boolean {
        return v > 0;
      },
    },
  },
  emits: ['change', 'update:current', 'update:pageSize', 'page-size-change', 'current-change'],
  data() {
    return {
      prevMore: false,
      nextMore: false,
      jumpIndex: this.current,
    };
  },

  computed: {
    /**
     * 样式计算
     */
    paginationClass(): ClassName {
      return [
        `${name}`,
        CLASSNAMES.SIZE[this.size],
        {
          [CLASSNAMES.STATUS.disabled]: this.disabled,
        },
      ];
    },
    totalClass(): ClassName {
      return [`${name}__total`];
    },
    sizerClass(): ClassName {
      return [`${name}__select`];
    },
    preBtnClass(): ClassName {
      return [
        `${name}__btn`,
        `${name}__btn-prev`,
        {
          [CLASSNAMES.STATUS.disabled]: this.disabled || this.current === 1,
        },
      ];
    },
    nextBtnClass(): ClassName {
      return [
        `${name}__btn`,
        `${name}__btn-next`,
        {
          [CLASSNAMES.STATUS.disabled]: this.disabled || this.current === this.pageCount,
        },
      ];
    },
    btnWrapClass(): ClassName {
      return [`${name}__pager`];
    },
    btnMoreClass(): ClassName {
      return [
        `${name}__number`,
        `${name}__number--more`,
        {
          [CLASSNAMES.STATUS.disabled]: this.disabled,
        },
      ];
    },
    jumperClass(): ClassName {
      return [`${name}__jump`];
    },
    jumperInputClass(): ClassName {
      return [`${name}__input`];
    },
    simpleClass(): ClassName {
      return [`${name}__select`];
    },
    isSimple(): boolean {
      return this.theme === 'simple';
    },
    pageCount(): number {
      const c: number = Math.ceil(this.total / this.pageSize);
      return c > 0 ? c : 1;
    },
    pageCountOption(): Array<{ label: string; value: number }> {
      const ans = [];
      for (let i = 1; i <= this.pageCount; i++) {
        ans.push({ value: i, label: `${i}/${this.pageCount}` });
      }
      return ans;
    },
    sizeOptions(): Array<{ label: string; value: number }> {
      const pageSizeOptions = this.pageSizeOptions as TdPaginationProps['pageSizeOptions'];
      const options = pageSizeOptions.map((option) =>
        typeof option === 'object'
          ? option
          : {
              label: this.t(this.global.itemsPerPage, { size: option }),
              value: Number(option),
            },
      );
      return options.sort((a, b) => a.value - b.value);
    },

    curPageLeftCount(): number {
      return Math.ceil((this.foldedMaxPageBtn - 1) / 2);
    },

    curPageRightCount(): number {
      return Math.ceil((this.foldedMaxPageBtn - 1) / 2);
    },

    isPrevMoreShow(): boolean {
      return 2 + this.curPageLeftCount < this.current;
    },

    isNextMoreShow(): boolean {
      return this.pageCount - 1 - this.curPageRightCount > this.current;
    },

    pages(): Array<number> {
      const array = [];
      let start;
      let end;

      if (this.isFolded) {
        if (this.isPrevMoreShow && this.isNextMoreShow) {
          start = this.current - this.curPageLeftCount;
          end = this.current + this.curPageRightCount;
        } else {
          start = this.isPrevMoreShow ? this.pageCount - this.foldedMaxPageBtn + 1 : 2;
          end = this.isPrevMoreShow ? this.pageCount - 1 : this.foldedMaxPageBtn;
        }
      } else {
        start = 1;
        end = this.pageCount;
      }

      for (let i = start; i <= end; i++) {
        array.push(i);
      }
      return array;
    },

    isFolded(): boolean {
      return this.pageCount > this.maxPageBtn;
    },
  },
  watch: {
    current(val) {
      this.jumpIndex = val;
    },
    jumpIndex(val) {
      if (val < 1) {
        this.$nextTick(() => {
          this.jumpIndex = 1;
        });
      }
      if (val > this.pageCount) {
        this.$nextTick(() => {
          this.jumpIndex = this.pageCount;
        });
      }
    },
  },
  methods: {
    toPage(pageIndex: number, isTriggerChange?: boolean): void {
      if (this.disabled) {
        return;
      }
      let current = pageIndex;
      if (pageIndex < 1) {
        current = 1;
      } else if (pageIndex > this.pageCount) {
        current = this.pageCount;
      }
      if (this.current !== current) {
        const prev = this.current;
        const pageInfo = {
          current,
          previous: prev,
          pageSize: this.pageSize,
        };
        if (isTriggerChange !== false) {
          emitEvent(this, 'change', pageInfo);
        }
        this.$emit('update:current', current);
        emitEvent(this, 'current-change', current, pageInfo);
      }
    },
    prevPage(): void {
      this.toPage(this.current - 1);
    },
    nextPage(): void {
      this.toPage(this.current + 1);
    },
    prevMorePage(): void {
      this.toPage(this.current - this.foldedMaxPageBtn);
    },
    nextMorePage(): void {
      this.toPage(this.current + this.foldedMaxPageBtn);
    },
    getButtonClass(index: number): ClassName {
      return [
        `${name}__number`,
        {
          [CLASSNAMES.STATUS.disabled]: this.disabled,
          [CLASSNAMES.STATUS.current]: this.current === index,
        },
      ];
    },
    onSelectorChange(e: string): void {
      if (this.disabled) {
        return;
      }
      const pageSize: number = parseInt(e, 10);
      let pageCount = 1;
      if (pageSize > 0) {
        pageCount = Math.ceil(this.total / pageSize);
      }

      let isIndexChange = false;

      if (this.current > pageCount) {
        isIndexChange = true;
      }

      /**
       * 分页大小变化事件
       * @param {Number} pageSize 分页大小
       * @param {Number} index 当前页
       */
      const pageInfo = {
        current: isIndexChange ? pageCount : this.current,
        previous: this.current,
        pageSize,
      };
      emitEvent(this, 'page-size-change', pageSize, pageInfo);
      emitEvent(this, 'change', pageInfo);
      if (isIndexChange) {
        this.toPage(pageCount, false);
      }
    },
    renderTotalContent() {
      const { locale, total, t } = this;
      if (this.$slots.totalContent) {
        return this.$slots.totalContent(null);
      }
      if (typeof this.totalContent === 'function') {
        return this.totalContent();
      }
      return t(locale.total, { total });
    },
    // 自定义页码时，相当于 current 发生变化
    onJumperChange(val: String) {
      const currentIndex = Number(val);
      if (isNaN(currentIndex)) return;
      this.toPage(currentIndex);
    },
    renderPagination() {
      return (
        <div class={this.paginationClass}>
          {/* 数据统计区 */}
          {renderTNodeJSX(
            this,
            'totalContent',
            <div class={this.totalClass}>{this.t(this.global.total, { total: this.total })}</div>,
          )}

          {/* select */}
          {this.pageSizeOptions.length > 0 && (
            <t-select
              size={this.size}
              value={this.pageSize}
              disabled={this.disabled}
              class={this.sizerClass}
              onChange={this.onSelectorChange}
            >
              {this.sizeOptions.map((item, index) => (
                <t-option value={item.value} label={item.label} key={index} />
              ))}
            </t-select>
          )}

          {/* 向前按钮 */}
          <div class={this.preBtnClass} onClick={this.prevPage} disabled={this.disabled || this.current === min}>
            <chevron-left-icon />
          </div>
          {/* 页数 */}
          {!this.isSimple ? (
            <ul class={this.btnWrapClass}>
              {this.isFolded && (
                <li class={this.getButtonClass(1)} onClick={() => this.toPage(min)}>
                  {min}
                </li>
              )}
              {this.isFolded && this.isPrevMoreShow ? (
                <li
                  class={this.btnMoreClass}
                  onClick={this.prevMorePage}
                  onMouseover={() => (this.prevMore = true)}
                  onMouseout={() => (this.prevMore = false)}
                >
                  {this.prevMore ? <chevron-left-double-icon /> : <ellipsis-icon />}
                </li>
              ) : null}
              {this.pages.map((i) => (
                <li class={this.getButtonClass(i)} key={i} onClick={() => this.toPage(i)}>
                  {i}
                </li>
              ))}
              {this.isFolded && this.isNextMoreShow ? (
                <li
                  class={this.btnMoreClass}
                  onClick={this.nextMorePage}
                  onMouseover={() => (this.nextMore = true)}
                  onMouseout={() => (this.nextMore = false)}
                >
                  {this.nextMore ? <chevron-right-double-icon /> : <ellipsis-icon />}
                </li>
              ) : null}
              {this.isFolded ? (
                <li class={this.getButtonClass(this.pageCount)} onClick={() => this.toPage(this.pageCount)}>
                  {this.pageCount}
                </li>
              ) : null}
            </ul>
          ) : (
            <t-select
              size={this.size}
              value={this.current}
              disabled={this.disabled}
              class={this.simpleClass}
              onChange={this.toPage}
              options={this.pageCountOption}
            />
          )}
          {/* 向后按钮 */}
          <div
            class={this.nextBtnClass}
            onClick={this.nextPage}
            disabled={this.disabled || this.current === this.pageCount}
          >
            <chevron-right-icon />
          </div>
          {/* 跳转 */}
          {/* 跳转 */}
          {this.showJumper ? (
            <div class={this.jumperClass}>
              {this.t(this.global.jumpTo)}
              <t-input
                class={this.jumperInputClass}
                v-model={this.jumpIndex}
                onBlur={this.onJumperChange}
                onEnter={this.onJumperChange}
              />
              {this.t(this.global.page)}
            </div>
          ) : null}
        </div>
      );
    },
  },
  render() {
    const { pageCount } = this;
    return pageCount >= 1 && this.renderPagination();
  },
});
