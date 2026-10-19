// Tawi Properties — Privacy Policy content.
//
// Same shape as an entry in src/data/terms.js (eyebrow, title, summary,
// sections[{ heading, paragraphs, points, affirm }]) so that one renderer,
// components/LegalDocument.vue, shows both.
//
// Unlike the terms, nobody "accepts" this document, so there is no version
// handshake with the backend — PRIVACY_VERSION and the date below are only
// shown on the page. Change them whenever the wording changes in a way that
// matters to people.
//
// This text describes what the app actually does today (checked against the
// signup, listing, contact, payment and map code, and the backend
// migrations). If you add a new tracker, analytics tool, email provider or
// anything else that touches personal data, add it to the sections below in
// the same commit.
//
// TODO (business / legal decisions, not code decisions):
//   - Register with the Office of the Data Protection Commissioner (ODPC)
//     as a data controller / processor if the law requires it for Tawi
//     Properties, and say so here once done.
//   - Decide concrete retention periods and write them into the
//     "How long we keep it" section (currently kept deliberately general).
//   - Name your hosting and email-delivery providers if you want to.
//   - Have the final wording reviewed by an advocate.
//   - We have no support email address yet, so contact lines point at the
//     same two channels as the terms (CONTACT_ROUTES).
import { CONTACT_ROUTES } from '@/data/terms.js'

export const PRIVACY_VERSION = '2026-10-19'
export const PRIVACY_EFFECTIVE_DATE = '19 October 2026'

export const PRIVACY = {
  key: 'privacy',
  version: PRIVACY_VERSION,
  eyebrow: 'Your data',
  title: 'Privacy Policy',
  summary:
    'The short version: we collect only what we need to run your account, publish listings and take the listing fee. We never sell your personal data, we do not run advertising or analytics trackers, and we never see your M-Pesa PIN. You can ask us for a copy of your data, to correct it, or to delete your account.',
  sections: [
    {
      heading: 'Who we are',
      paragraphs: [
        'Tawi Properties is a property listing site for Kenya. In this policy “we”, “us” and “Tawi Properties” mean the business that runs this site, and we are the data controller for the personal data described here: we decide why and how it is used.',
        `You can reach us about anything in this policy through ${CONTACT_ROUTES}.`
      ]
    },
    {
      heading: 'The law we follow',
      paragraphs: [
        'We handle personal data in line with the Data Protection Act, 2019 of Kenya and its regulations. In short, that means we use your data only for clear, stated purposes, keep what we hold accurate and secure, keep it no longer than we need to, and respect your rights over it.'
      ]
    },
    {
      heading: 'What we collect',
      paragraphs: [
        'It depends on what you do on the site. We collect it either from you directly, or from the services you choose to use with us (Google sign-in, M-Pesa):'
      ],
      points: [
        'Your account: your name, email address and a password. We store only a scrambled (hashed) form of your password, never the password itself. If you sign in with Google, we receive your name, email address, profile picture and Google account ID instead.',
        'Your listings: the property type, price range, location and map pin, description and up to three photos, together with the name, phone number and email address you give for that listing. If you ask us to edit a listing, we keep the edit request and the note you give with it.',
        'Your payments: when you pay the listing fee, we record the phone number you pay from, the amount, the M-Pesa receipt number and the status of the payment. We do not receive or store your M-Pesa PIN, one-time codes or any card details; you enter your PIN on your own phone, with Safaricom.',
        'Your messages: anything you send us through the Contact form, and the replies we send back, linked to your account.',
        'Your agreement to our terms: when you accept the terms we keep which version you accepted and when, together with your IP address and browser details, so that we can show what was agreed.',
        'Technical data: your IP address and browser details when you sign in or use the site, and routine records of errors and security events. These help us keep the site secure and fix faults.'
      ]
    },
    {
      heading: 'Why we use it',
      paragraphs: [
        'We use personal data for these purposes, and for nothing unrelated to them:'
      ],
      points: [
        'To create and run your account, and to sign you in securely.',
        'To review, publish, feature and manage property listings, and to let buyers and tenants reach sellers.',
        'To take the listing fee, match it to the right listing, and handle refunds.',
        'To reply to your messages and to send you emails you need, such as a password reset code.',
        'To keep a record of the terms you accepted.',
        'To prevent fraud and abuse, to act on reports, and to protect the site and the people who use it.',
        'To meet our legal obligations, for example keeping financial records, or responding to a lawful request from the police or another authority.'
      ]
    },
    {
      heading: 'What other people can see',
      paragraphs: [
        'A listing is public by design. The phone number and email address you put on a listing are shown so that buyers and tenants can contact you: people who are signed in see them in full, and visitors who are not signed in see a partly hidden number and no email address. Please do not put a number or address on a listing that you are not happy to publish.',
        'Your account name and email address, your payment details, your messages to us and your edit requests are not shown to other users. They are visible only to you and to our team.'
      ]
    },
    {
      heading: 'Who we share data with',
      paragraphs: [
        'We do not sell your personal data and we do not share it for advertising. We share it only where it is needed to run the service:'
      ],
      points: [
        'Safaricom (M-Pesa): to send the payment prompt to your phone and confirm the payment.',
        'Google: if you use “Sign in with Google”, Google tells us who you are, and Google’s own privacy policy applies to your Google account. The site also loads its fonts from Google, which means Google can see that a visitor’s device requested them.',
        'Map services: the maps on the site use OpenFreeMap for map tiles and Photon (run by Komoot) to search for places. When you view or search a map, your device and the text you search for are sent to those services.',
        'Our hosting and email-delivery providers: they store the data and send our emails on our instructions, and may not use it for their own purposes.',
        'Authorities: the police, a court or another authority, where the law requires it, or where we reasonably believe it is needed to deal with fraud or other serious wrongdoing.',
        'WhatsApp: links to WhatsApp on the site open a chat with us in WhatsApp, which is run by Meta under its own terms. Nothing is sent to WhatsApp until you choose to message us.'
      ],
      affirm:
        'Some of these services run outside Kenya, so your data may be processed in other countries. Where that happens we only use providers that protect personal data to a standard the Data Protection Act accepts.'
    },
    {
      heading: 'Cookies and browser storage',
      paragraphs: [
        'We use only what the site needs in order to work. We do not use advertising cookies, and we do not use third-party analytics or tracking tools.'
      ],
      points: [
        'A session cookie keeps you signed in, and a security cookie protects your requests from being forged by other sites. These are essential: without them you cannot log in.',
        'A small amount of browser storage remembers a payment you have started, so that if you reload the page we can still confirm it, and remembers listing countdown timers. It stays on your own device.'
      ],
      affirm:
        'You can clear cookies and site data in your browser at any time. If you do, you will be signed out.'
    },
    {
      heading: 'How long we keep it',
      paragraphs: [
        'We keep personal data only for as long as we need it for the purposes above:'
      ],
      points: [
        'Account and listing data: for as long as your account exists. When you ask us to delete your account, we delete or anonymise your personal data, except for what we are required to keep.',
        'Payment and terms-acceptance records: for as long as the law requires financial records to be kept, and as evidence of what was agreed and paid, even after an account is deleted.',
        'Messages: for as long as your account exists, so that you can see your conversation with us.',
        'Technical logs: for a limited period only, long enough to find and fix faults and to investigate security problems.'
      ]
    },
    {
      heading: 'How we protect it',
      paragraphs: [
        'We use reasonable technical and organisational measures: the site is served over an encrypted (HTTPS) connection, passwords are stored hashed, sign-in uses protected cookies, and access to personal data is limited to the people who need it to run the service. No system is perfectly secure, so please also keep your password to yourself and tell us if you think your account has been used by someone else.',
        `If a breach affects your personal data in a way that could harm you, we will tell you and the Office of the Data Protection Commissioner as the law requires. To report a problem, use ${CONTACT_ROUTES}.`
      ]
    },
    {
      heading: 'Your rights',
      paragraphs: [
        'Under the Data Protection Act you have the right to:'
      ],
      points: [
        'be told how your data is used (this policy does that);',
        'ask for a copy of the personal data we hold about you;',
        'ask us to correct data that is wrong or incomplete;',
        'ask us to delete your data, including your account, subject to what we must keep by law;',
        'object to, or ask us to limit, how we use your data; and',
        'ask for your data in a common format so that you can move it elsewhere.'
      ],
      affirm:
        `To use any of these rights, contact us through ${CONTACT_ROUTES}. We may need to confirm it is really you first. We will answer within the time the law allows. If you are not satisfied, you have the right to complain to the Office of the Data Protection Commissioner in Kenya.`
    },
    {
      heading: 'Children',
      paragraphs: [
        'Tawi Properties is for adults. You must be at least 18 to hold an account, and we do not knowingly collect personal data from anyone under 18. If you think a child has given us their data, tell us and we will delete it.'
      ]
    },
    {
      heading: 'Changes to this policy',
      paragraphs: [
        'If we change this policy in a way that matters, we will update the date at the bottom of this page and, where the change is significant, tell signed-in users when they next sign in.'
      ]
    },
    {
      heading: 'Contact',
      paragraphs: [
        `Questions about this policy or about your data are welcome: reach us through ${CONTACT_ROUTES}. This policy is governed by the laws of Kenya.`
      ]
    }
  ]
}

export default PRIVACY