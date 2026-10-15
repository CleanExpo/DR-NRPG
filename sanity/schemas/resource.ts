/**
 * Sanity Schema: Resource
 *
 * Defines the schema for downloadable resources in the CMS.
 * Includes documents, templates, checklists, and tools.
 */

import { defineType, defineField } from '@sanity/types'

export default defineType({
  name: 'resource',
  title: 'Resource',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required().min(5).max(100),
      description: 'The name of the resource',
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
      description: 'URL-friendly version of the title',
    }),
    defineField({
      name: 'type',
      title: 'Resource Type',
      type: 'string',
      options: {
        list: [
          { title: 'Document', value: 'document' },
          { title: 'Template', value: 'template' },
          { title: 'Checklist', value: 'checklist' },
          { title: 'Tool', value: 'tool' },
          { title: 'Video', value: 'video' },
          { title: 'Guide', value: 'guide' },
          { title: 'Infographic', value: 'infographic' },
        ],
        layout: 'dropdown',
      },
      validation: (Rule) => Rule.required(),
      description: 'Type of resource',
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 4,
      validation: (Rule) => Rule.required().min(50).max(300),
      description: 'Brief description of the resource',
    }),
    defineField({
      name: 'body',
      title: 'Article Body',
      type: 'array',
      of: [{ type: 'block' }],
      description: 'Public companion text. Margot series resources use the margot-series tag. Drafts remain excluded from the public reader.',
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'reference',
      to: [{ type: 'category' }],
      validation: (Rule) => Rule.required(),
      description: 'Resource category',
    }),
    defineField({
      name: 'featuredImage',
      title: 'Preview Image',
      type: 'image',
      options: {
        hotspot: true,
      },
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alternative text',
          validation: (Rule) => Rule.required(),
        },
      ],
      description: 'Preview or thumbnail image',
    }),
    defineField({
      name: 'file',
      title: 'File',
      type: 'object',
      fields: [
        {
          name: 'asset',
          title: 'File Asset',
          type: 'file',
          validation: (Rule) => Rule.required(),
        },
        {
          name: 'size',
          title: 'File Size',
          type: 'string',
          description: 'e.g., "2.5 MB"',
        },
        {
          name: 'format',
          title: 'File Format',
          type: 'string',
          options: {
            list: [
              { title: 'PDF', value: 'pdf' },
              { title: 'Word (.docx)', value: 'docx' },
              { title: 'Excel (.xlsx)', value: 'xlsx' },
              { title: 'PowerPoint (.pptx)', value: 'pptx' },
              { title: 'ZIP', value: 'zip' },
              { title: 'Image', value: 'image' },
            ],
          },
        },
      ],
      description: 'The downloadable file',
    }),
    defineField({
      name: 'externalUrl',
      title: 'External URL',
      type: 'url',
      description: 'Alternative to file upload - link to external resource',
    }),
    defineField({
      name: 'isPremium',
      title: 'Premium Resource',
      type: 'boolean',
      description: 'Requires subscription or payment to access',
      initialValue: false,
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        layout: 'tags',
      },
      description: 'Keywords for search and filtering',
    }),
    defineField({
      name: 'relatedResources',
      title: 'Related Resources',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{ type: 'resource' }],
        },
      ],
      description: 'Other resources that might be helpful',
    }),
    defineField({
      name: 'downloadCount',
      title: 'Download Count',
      type: 'number',
      readOnly: true,
      description: 'Number of times this resource has been downloaded',
      initialValue: 0,
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published Date',
      type: 'datetime',
      validation: (Rule) => Rule.required(),
      description: 'When this resource was published',
      initialValue: () => new Date().toISOString(),
    }),
    defineField({
      name: 'lastUpdated',
      title: 'Last Updated',
      type: 'datetime',
      description: 'When this resource was last updated',
    }),
    defineField({
      name: 'featured',
      title: 'Featured Resource',
      type: 'boolean',
      description: 'Display this resource prominently',
      initialValue: false,
    }),
    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'object',
      fields: [
        {
          name: 'metaTitle',
          title: 'Meta Title',
          type: 'string',
          validation: (Rule) => Rule.max(60),
        },
        {
          name: 'metaDescription',
          title: 'Meta Description',
          type: 'text',
          rows: 3,
          validation: (Rule) => Rule.max(160),
        },
        {
          name: 'keywords',
          title: 'Keywords',
          type: 'array',
          of: [{ type: 'string' }],
        },
      ],
    }),
  ],
  preview: {
    select: {
      title: 'title',
      type: 'type',
      category: 'category.name',
      media: 'featuredImage',
    },
    prepare(selection) {
      return {
        ...selection,
        subtitle: `${selection.type} - ${selection.category}`,
      }
    },
  },
})
