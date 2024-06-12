<template>
    <div>
      <div v-if="visible" class="modal-mask">
        <div class="modal-wrapper">
          <div class="modal-container">
            <div class="modal-header">
              <slot name="title"></slot>
            </div>
            <div class="modal-body">
              <slot name="body"></slot>
            </div>
            <div class="modal-footer">
              <slot name="footer"></slot>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    props: {
      visible: {
        type: Boolean,
        default: false,
      },
    },
    methods: {
      closeDialog() {
        this.$emit('update:visible', false);
        this.$emit('cancel');
      },
      done() {
        this.$emit('update:visible', false);
        this.$emit('confirm');
      },
    },
  };
  </script>
  