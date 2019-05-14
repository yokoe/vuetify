<template>
  <div>
    <v-file-upload
      :accept="accept"
      :multiple="multiple"
      :disabled="disabled"
      :upload-on-select="onSelect"
      :file-details="details"
      :read-as="readAs"
      :uploader="uploader"
    ></v-file-upload>

    <v-layout
      align-center
      justify-center
    >
      <v-flex
        xs12
        md8
      >
        <v-select
          v-model="accept"
          :items="acceptItems"
          label="accept"
        ></v-select>
        <v-select
          v-model="readAs"
          :items="readAsItems"
          clearable
          label="read-as"
        ></v-select>
        <v-layout wrap>
          <v-checkbox
            v-model="disabled"
            class="pr-3"
            label="disabled"
          ></v-checkbox>
          <v-checkbox
            v-model="multiple"
            class="pr-3"
            label="multiple"
          ></v-checkbox>
          <v-checkbox
            v-model="details"
            class="pr-3"
            label="details"
          ></v-checkbox>
          <v-checkbox
            v-model="onSelect"
            class="pr-3"
            label="on-select"
          ></v-checkbox>
        </v-layout>
        <v-checkbox
          v-model="error"
          label="Fail Uploads"
        ></v-checkbox>
      </v-flex>
    </v-layout>
  </div>
</template>

<script>
  export default {
    data: () => ({
      accept: '*',
      acceptItems: [
        '*',
        '.pdf',
        'image/*',
        'application/vnd.ms-excel',
        '.png,.jpg,.gif'
      ],
      multiple: false,
      disabled: false,
      onSelect: false,
      details: false,
      readAs: undefined,
      error: false,
      readAsItems: [
        'BinaryString',
        'DataURL',
        'Text'
      ]
    }),
    methods: {
      async uploader (file, data) {
        const time = Math.floor(Math.random() * (20)) * 250
        const wait = ms => new Promise((resolve, reject) => setTimeout(resolve, ms))
        await wait(time)
        console.log(file, data)
        return !this.error
      }
    }
  }
</script>
