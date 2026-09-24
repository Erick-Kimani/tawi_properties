// Tawi Properties — terms content.
//
// This is the only place the wording lives on the frontend. Two audiences:
//
//   general → everyone with an account (buyers, tenants, browsers).
//             Accepted once, at sign-up.
//   seller  → someone publishing a property. Accepted per listing, because
//             the declaration is about *that* property ("I have the right
//             to advertise this property"), not about the account.
//
// IMPORTANT: TERMS_VERSION must match config/terms.php on the backend.
// The backend re-checks the version it is sent and refuses anything that
// isn't current, so bumping one without the other will block sign-ups and
// submissions — change both in the same commit.
//
// Bump the version whenever the wording changes in a way that affects
// what a user is agreeing to. Old acceptances stay in terms_acceptances
// with the version they actually agreed to, which is the whole point of
// storing the version rather than a bare boolean.
export const TERMS_VERSION = '2026-09-16'

// Shown in the drawer header. Kept separate from the version string so the
// version can stay machine-ish while the date reads normally.
export const TERMS_EFFECTIVE_DATE = '16 September 2026'

// TODO (business decision, not a code decision): the fee, the refund
// window and the featured period below are written to match what the app
// currently does — a per-listing fee taken before review, and one calendar
// month of featured placement (see Admin.vue's FEATURE_MONTHS). If any of
// those change, this copy has to change with them, or the terms stop
// describing the product.
export const SUPPORT_EMAIL = 'support@tawiproperties.co.ke'

export const TERMS = {
  general: {
    key: 'general',
    version: TERMS_VERSION,
    eyebrow: 'For buyers and tenants',
    title: 'Using Tawi Properties',
    summary:
      'The short version: we publish listings, we do not verify who owns what, and we are never part of your payment. Please check before you pay anyone.',
    sections: [
      {
        heading: 'What Tawi Properties is',
        paragraphs: [
          'Tawi Properties is a listing site. Property owners, landlords and agents place their own listings here, and you contact them directly.',
          'We are not an estate agent, broker, valuer, advocate or escrow service. We are not a party to any sale or tenancy you agree with a seller, landlord or agent, and we never receive deposits, rent or purchase money. The only payment we ever take is a listing fee, paid by sellers, for placing a listing on the site.'
        ]
      },
      {
        heading: 'What we check, and what we do not',
        paragraphs: [
          'We review every listing before it is published, and we remove listings that break these terms or that we have good reason to think are fraudulent.',
          'We do not verify ownership, title, a seller\u2019s authority to sell or let, the accuracy of a price, the condition of a property, or any document a seller shows you. A listing appearing here is not a verification of the seller or the property.',
          'Where a listing is marked as promoted or featured, that means the seller paid for placement. It is not a badge of approval and it does not mean we checked anything extra.'
        ]
      },
      {
        heading: 'Before you pay anyone',
        paragraphs: [
          'Most property fraud in Kenya is stopped by ordinary checks done before money moves. We strongly recommend all of the following, and we would rather lose a transaction than see you lose a deposit:'
        ],
        points: [
          'Do an official search at the Lands Registry against the title number.',
          'Visit the property in person, and take someone with you.',
          'Confirm the identity of the person you are dealing with, and their authority to sell or let, in writing.',
          'Use an advocate for any agreement, and let them hold deposits.',
          'Pay in a traceable way, to a verified account, and never because a listing looks legitimate.'
        ],
        affirm:
          'I understand that seeing a property on Tawi Properties is not a reason on its own to send money to anybody.'
      },
      {
        heading: 'Contacting a seller',
        paragraphs: [
          'When you send an enquiry, the name, phone number and email you give are shared with that seller so they can reply. They may use those details to respond about that listing, and nothing else.',
          'Sellers\u2019 contact details are shown in full to people who are signed in, and partly hidden from visitors who are not.'
        ]
      },
      {
        heading: 'Your account',
        paragraphs: [
          'Give us real details, keep your password to yourself, and tell us if you think someone else is using your account. One account per person. You need to be at least 18 to hold an account.'
        ]
      },
      {
        heading: 'Reporting a listing',
        paragraphs: [
          `If a listing looks wrong \u2014 the property is not there, the person cannot prove authority, the details do not match \u2014 use the report link on the listing, or email ${SUPPORT_EMAIL}. We look at every report and aim to respond within 3 working days. Reporting is free and you do not need to have paid anything.`
        ]
      },
      {
        heading: 'What each of us is responsible for',
        paragraphs: [
          'We will run the site with reasonable care and skill, review listings before publishing, and act on reports. We cannot promise the site is always available or that every listing is accurate, because the information in a listing comes from the seller.',
          'You are responsible for your own decisions, payments and agreements with a seller, landlord or agent. We are not liable for loss arising out of a transaction we are not part of.',
          'Nothing in these terms limits any liability that cannot be limited by law \u2014 including for fraud, or for death or personal injury caused by negligence.'
        ]
      },
      {
        heading: 'Your personal data',
        paragraphs: [
          'We handle your personal data under the Data Protection Act, 2019. We collect what we need to run your account and pass your enquiries to sellers, and we do not sell your data. You can ask us for a copy of your data, ask us to correct it, or ask us to delete your account. Our Privacy Policy explains this in full.'
        ]
      },
      {
        heading: 'Changes, disputes and contact',
        paragraphs: [
          'If we change these terms in a way that affects what you are agreeing to, we will ask you to accept the new version the next time you sign in. Your earlier acceptance stays on record as it was.',
          `These terms are governed by the laws of Kenya, and the courts of Kenya have jurisdiction. If something goes wrong, please write to us at ${SUPPORT_EMAIL} first \u2014 most things are faster to fix that way.`
        ]
      }
    ],
    confirmation:
      'I have read and accept these terms. I understand that Tawi Properties does not verify ownership, and that I am responsible for my own checks before I pay anyone.'
  },

  seller: {
    key: 'seller',
    version: TERMS_VERSION,
    eyebrow: 'For listing a property',
    title: 'Listing on Tawi Properties',
    summary:
      'The short version: you are declaring that this property is yours to advertise and that the details are true. We review, publish and promote it. What you agree with a buyer is between the two of you.',
    sections: [
      {
        heading: 'What you are declaring about this property',
        paragraphs: [
          'By submitting this listing you are telling us, and everyone who sees it, that:'
        ],
        points: [
          'You own this property or have written authority from the owner to advertise it.',
          'The documents and ownership details you rely on are genuine, and you have not been asked by anyone to present them otherwise.',
          'The price, location, description and photos are accurate as far as you know.',
          'You will update or remove the listing once the property is sold, let, or off the market.'
        ]
      },
      {
        heading: 'Your photos and description',
        paragraphs: [
          'They stay yours. You give us permission to display, resize and use them to promote the listing on the site and our own channels for as long as the listing runs, and for a short period afterwards while caches and search results clear.',
          'You confirm the photos are of this property and that you are allowed to use them \u2014 not taken from another listing, another agent, or a stock library you have no licence for.'
        ]
      },
      {
        heading: 'The listing fee',
        paragraphs: [
          'Listing is paid. The exact amount is shown on the payment screen before you confirm, and it is charged per listing, before we review it.',
          'It is a placement fee. It is not commission, it is not a deposit, and it does not entitle you to a sale. Once approved, your listing runs as featured for one calendar month from the day we publish it, after which it comes down automatically. You can list it again by paying again.'
        ]
      },
      {
        heading: 'Review, rejection and refunds',
        paragraphs: [
          'We review every submission before it goes live. We will tell you the outcome, and if we reject it we will tell you why.',
          'If we reject your listing for a reason that is not about false, misleading or unauthorised information \u2014 for example we cannot support that property type, or there is a problem on our side \u2014 we refund the fee in full within 7 working days.',
          'If we reject it because the information or documents you gave were false, misleading or not yours to use, the fee is not refunded.',
          'If you withdraw the listing before we have reviewed it, we refund it in full. Once it has been published, the fee is not refundable for the remainder of that month.'
        ]
      },
      {
        heading: 'Your contact details are published',
        paragraphs: [
          'The phone number and email on this form are shown on the listing so buyers and tenants can reach you. Signed-in users see them in full; visitors who are not signed in see a partly hidden number and no email. Do not put a number here that you are not happy to publish.'
        ]
      },
      {
        heading: 'If we take a listing down',
        paragraphs: [
          'We can remove a listing, or suspend an account, if it breaks these terms, if we have good reason to suspect fraud, or if we are required to by law.',
          `We will tell you the reason. If you think we got it wrong, reply to that message or write to ${SUPPORT_EMAIL} within 14 days and a person will look at it again. If the removal turns out to have been our mistake, we will republish the listing for the time it lost, or refund the fee.`
        ]
      },
      {
        heading: 'What each of us is responsible for',
        paragraphs: [
          'We publish, review and promote the listing, and we give you a way to reach us. We are not your agent and we are not a party to any sale or tenancy you agree. We do not negotiate for you, hold money for you, or guarantee that anyone will buy or rent.',
          'You deal with buyers and tenants directly, and you are responsible for what you publish here. If someone brings a claim against us because information you gave was false, unauthorised or not yours to use, you will cover the direct losses and reasonable legal costs that claim causes us. That is limited to claims arising from your own listing, and nothing in it limits liability that cannot be limited by law.'
        ]
      },
      {
        heading: 'Your personal data',
        paragraphs: [
          'We handle your personal data under the Data Protection Act, 2019, including the contact details published on your listing and the M-Pesa record of your fee. Our Privacy Policy explains what we keep and for how long, and you can ask for a copy, a correction, or deletion of your account.'
        ]
      },
      {
        heading: 'Changes, disputes and contact',
        paragraphs: [
          'If we change these terms, the next listing you submit will show you the new version to accept. The version you accepted for an existing listing keeps applying to that listing.',
          `These terms are governed by the laws of Kenya, and the courts of Kenya have jurisdiction. Please write to ${SUPPORT_EMAIL} before taking anything further.`
        ]
      }
    ],
    confirmation:
      'I confirm I have the right to advertise this property, that the details I have given are accurate, and that I accept these seller terms.'
  }
}

export function getTerms(audience) {
  return TERMS[audience] || TERMS.general
}

export default TERMS