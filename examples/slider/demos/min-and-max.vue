<template>
  <div class="demo-slider">
    <div class="block">
      <t-slider
        v-model="value1"
        :show-tooltip="true"
        :max="max"
        :min="min"
        :marks="marks"
        :input-number-props="false"
      />
    </div>

    <div class="block">
      <t-slider
        v-model="value2"
        range
        :show-tooltip="true"
        :max="max"
        :min="min"
        :marks="marks"
        :input-number-props="false"
      />
    </div>
  </div>
</template>
<script>
import { defineComponent, ref } from 'vue';

export default defineComponent({
  setup() {
    const value1 = ref(12);
    const value2 = ref([12, 20]);
    return {
      value1,
      value2,
      min: 10,
      max: 30,
      marks: {
        10: 'min:10',
        30: 'max:30',
      },
    };
  },
});
</script>
<style>
.block {
  padding: 30px 24px;
}
</style>
