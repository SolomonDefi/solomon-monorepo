<template>
  <svg
    width="30px"
    height="25px"
    viewBox="0 0 30 25"
    version="1.1"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <!-- eslint-disable max-len -->
      <path
        id="path-1"
        d="M25.983,8.342 C25.988,8.228 26,8.116 26,8 C26,3.582 22.418,0 18,0 C14.89,0 12.2,1.779 10.877,4.371 C10.296,4.136 9.665,4 9,4 C6.47,4 4.401,5.885 4.068,8.324 C1.703,9.129 0,11.363 0,14 C0,17.314 2.686,20 6,20 L24,20 C27.314,20 30,17.314 30,14 C30,11.382 28.321,9.162 25.983,8.342 Z M11.293,11.293 L14.293,8.293 C14.488,8.098 14.744,8 15,8 C15.256,8 15.512,8.098 15.707,8.293 L18.707,11.293 C19.098,11.684 19.098,12.316 18.707,12.707 C18.316,13.098 17.684,13.098 17.293,12.707 L16,11.414 L16,24 C16,24.552 15.553,25 15,25 C14.447,25 14,24.552 14,24 L14,11.414 L12.707,12.707 C12.316,13.098 11.684,13.098 11.293,12.707 C10.902,12.316 10.902,11.684 11.293,11.293 Z"
      />
      <!-- eslint-enable max-len -->
    </defs>
    <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
      <mask id="mask-2" fill="white">
        <use xlink:href="#path-1" />
      </mask>
      <use :fill="color" fill-rule="nonzero" xlink:href="#path-1" />
      <g mask="url(#mask-2)" :fill="color">
        <rect x="0" y="0" width="32" height="32" />
      </g>
    </g>
  </svg>
</template>

<script lang="ts" setup>
defineProps({
  color: {
    type: String,
    default: 'white',
  },
})
</script>
