/* eslint-disable no-undef */
/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleFileExtensions: ["js", "json", "vue"],
  transform: {
    "^.+\\.vue$": "@vue/vue3-jest"
  }
};