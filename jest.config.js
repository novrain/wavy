/* eslint-disable no-undef */
/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleFileExtensions: ["ts", "js", "json", "vue"],
  modulePathIgnorePatterns: ['<rootDir>/dist/'],
  transform: {
    "^.+\\.vue$": "@vue/vue3-jest"
  }
}