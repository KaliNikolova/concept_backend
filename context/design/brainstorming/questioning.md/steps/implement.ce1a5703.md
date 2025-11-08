---
timestamp: 'Fri Nov 07 2025 04:18:26 GMT-0500 (Eastern Standard Time)'
parent: '[[..\20251107_041826.aa2ca3cb.md]]'
content_id: ce1a5703caf55affc7148718b79c101c9e8471fbc503b7655baca28d2517bc43
---

# implement: can u now create those syncs. Here is an example that might help you

/\*\*

 \* Sample synchronizations: feel free to delete this entire file!

 \*/

import { LikertSurvey, Requesting } from "@concepts";

import { actions, Sync } from "@engine";

export const CreateSurveyRequest: Sync = (

  { request, author, title, scaleMin, scaleMax },

) => ({

  when: actions(\[

    Requesting.request,

    { path: "/LikertSurvey/createSurvey", author, title, scaleMin, scaleMax },

    { request },

  ]),

  then: actions(\[LikertSurvey.createSurvey, {

    author,

    title,

    scaleMin,

    scaleMax,

  }]),

});

export const CreateSurveyResponse: Sync = ({ request, survey }) => ({

  when: actions(

    \[Requesting.request, { path: "/LikertSurvey/createSurvey" }, { request }],

    \[LikertSurvey.createSurvey, {}, { survey }],

  ),

  then: actions(\[Requesting.respond, { request, survey }]),

});

export const AddQuestionRequest: Sync = ({ request, survey, text }) => ({

  when: actions(\[

    Requesting.request,

    { path: "/LikertSurvey/addQuestion", survey, text },

    { request },

  ]),

  then: actions(\[LikertSurvey.addQuestion, { survey, text }]),

});

export const AddQuestionResponse: Sync = ({ request, question }) => ({

  when: actions(

    \[Requesting.request, { path: "/LikertSurvey/addQuestion" }, { request }],

    \[LikertSurvey.addQuestion, {}, { question }],

  ),

  then: actions(\[Requesting.respond, { request, question }]),

});
