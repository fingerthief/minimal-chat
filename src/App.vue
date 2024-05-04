<script setup>
import ChatLayout from './views/ChatLayout.vue';
</script>
<template>

    <body>
        <ChatLayout />
    </body>
</template>

<style lang="scss">
@font-face {
    font-family: Roboto-Regular;
    src: url('/webfonts/Roboto-Regular.ttf');
    font-weight: 400;
    font-style: normal;
}

body {
    display: flex;
    font-family: Roboto-Regular, sans-serif;

    @media (max-width: 600px) {
        font-size: 14px;
    }
}

@keyframes spinner {
    to {
        transform: rotate(360deg);
    }
}

.spinner {
    display: inline-block;
    width: 10px;
    color: lightskyblue;
    height: 10px;
    margin-left: 5px;
    border: 4px solid #3c8280;
    border-left-color: #1cdfd8;
    border-radius: 50%;
    animation: spinner 1s linear infinite;
}

.loading {
    background-color: #3a3a3c;
    color: rgba(255, 255, 255, 0.7);
}

.loading::after {
    content: "";
    position: absolute;
    top: 0;
    left: -5px;
    border-width: 5px 5px 0 0;
    border-style: solid;
    border-color: transparent #3a3a3c;
}
</style>
