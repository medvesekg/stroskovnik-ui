<template>
  <div>
    parse:
    {{ $parse.date.databaseDateTime('2020-11-21T09:36:10.737984+00:00') }}
    format: {{ $format.date.databaseDateTime(new Date()) }}
  </div>
</template>

<script>
export default {
  data() {
    return {
      date: new Date(),
      range: null
    }
  }
}
</script>

<style></style>
