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
export const TERMS_VERSION = '2026-10-05'

// Shown in the drawer header. Kept separate from the version string so the
// version can stay machine-ish while the date reads normally.
export const TERMS_EFFECTIVE_DATE = '5 October 2026'

// TODO (business decisions, not code decisions): the wording below makes
// commitments that the product and the team have to actually keep. If any
// of these change, this copy has to change with them, or the terms stop
// describing the product:
//
//   - the fee is per listing, taken by M-Pesa STK push BEFORE review
//   - one calendar month of featured placement (Admin.vue FEATURE_MONTHS)
//   - refunds go back to the M-Pesa number that paid, within 7 working days
//   - a paid listing that fails to submit because of our fault is
//     submitted or refunded in full
//   - reports are answered within 3 working days
//   - removal decisions can be challenged within 14 days
//   - two edit requests per listing (PropertyEditRequestModal.vue)
export const SUPPORT_EMAIL = 'support@tawiproperties.co.ke'

export const TERMS = {
  general: {
    key: 'general',
    version: TERMS_VERSION,
    eyebrow: 'For buyers and tenants',
    title: 'Using Tawi Properties',
    summary:
      'The short version: owners, landlords and agents list their own properties here, and you deal with them directly. We review listings and act on reports, but we cannot verify ownership for you, and we never touch your purchase or rent money. A few simple checks before you pay will protect you.',
    sections: [
      {
        heading: 'What Tawi Properties is',
        paragraphs: [
          'Tawi Properties is a listing site. Property owners, landlords and agents place their own listings here, and you contact them directly. Our job is to put listings in front of you, give you a way to reach the seller, and give you a way to tell us when something looks wrong.',
          'We are not an estate agent, broker, valuer, advocate or escrow service. We are not a party to any sale or tenancy you agree with a seller, landlord or agent.'
        ]
      },
      {
        heading: 'Where money goes, and where it does not',
        paragraphs: [
          'There are only three money routes connected to this site. Knowing them makes it much easier to spot a request that does not belong:'
        ],
        points: [
          'You to Tawi Properties: nothing. Browsing, enquiring, seeing a seller’s contact details and reporting a listing are all free. We never charge buyers or tenants to view, to “reserve” or to “verify” a property.',
          'You to the seller, landlord or agent: any purchase price, rent or deposit is agreed and paid directly between you and them, outside this site. Tawi Properties does not receive it, hold it, pass it on or guarantee it.',
          'Seller to Tawi Properties: the only payment we ever take is the listing fee that sellers pay, through an M-Pesa payment prompt inside the app. It is the only thing we will ever ask anyone to pay us.'
        ],
        affirm:
          'If anyone — including someone using our name or logo — asks you to send money to “Tawi Properties”, to a “viewing”, “verification” or “booking” fee, or to a personal number or account on our behalf, it is not us. Please do not pay, and tell us at ' +
          SUPPORT_EMAIL +
          '. We will never ask for your M-Pesa PIN, a one-time code or your password.'
      },
      {
        heading: 'What we check, and what we do not',
        paragraphs: [
          'We review every listing before it is published, and we remove listings that break these terms or that we have good reason to think are fraudulent or misleading.',
          'We do not verify ownership, title, a seller’s authority to sell or let, the accuracy of a price, the condition of a property, the exact position of a map pin, or any document a seller shows you. A listing appearing here is not a verification of the seller or the property.',
          'Where a listing is marked as promoted or featured, that means the seller paid for placement. It is not a badge of approval and it does not mean we checked anything extra.'
        ]
      },
      {
        heading: 'Before you pay anyone',
        paragraphs: [
          'Most property fraud is stopped by ordinary checks done before money moves. We strongly recommend all of the following. We would rather you walk away from a deal than lose a deposit:'
        ],
        points: [
          'Do an official search on the title number (through Ardhisasa or the relevant Lands Registry) and check that the registered owner, the size and any charges or restrictions match what you were told.',
          'Match the person to the paper. Check that the seller’s ID matches the registered owner, or that they hold written authority from the owner. For agents and caretakers, ask for that authority in writing.',
          'Visit the property in person, take someone with you, and for land have the boundaries confirmed by a licensed surveyor.',
          'Use an advocate with a current practising certificate for any purchase, and have deposits and purchase money paid through the advocate’s client account rather than to an individual.',
          'For rentals, sign a written tenancy agreement, pay the person named in it as landlord or agent, and ask for a receipt for every payment.',
          'Pay by a traceable route (bank transfer, cheque, or a documented mobile money payment to the named party), and keep every receipt, message and agreement.',
          'Be careful if you are rushed, if the price is far below the market, or if the seller cannot be met or the property cannot be viewed until you have paid something first.'
        ],
        affirm:
          'I understand that seeing a property on Tawi Properties is not a reason on its own to send money to anybody.'
      },
      {
        heading: 'Contacting a seller',
        paragraphs: [
          'When you send an enquiry, the name, phone number and email you give are shared with that seller so they can reply. They may use those details to respond about that listing, and nothing else.',
          'Sellers’ contact details are shown in full to people who are signed in, and partly hidden from visitors who are not.',
          'Sellers are real people. Please treat them with courtesy: do not harass them, copy or collect their contact details in bulk, pass them on, or pose as a seller or agent yourself. We may suspend accounts that do.'
        ]
      },
      {
        heading: 'Your account',
        paragraphs: [
          'Give us real details, keep your password to yourself, and tell us if you think someone else is using your account. One account per person. You need to be at least 18 to hold an account.'
        ]
      },
      {
        heading: 'If something looks wrong, or goes wrong',
        paragraphs: [
          `If a listing looks wrong — the property is not there, the person cannot prove authority, the details do not match — tell us through the Contact page or at ${SUPPORT_EMAIL}. We look at every report and aim to respond within 3 working days. Reporting is free, and you do not need to have paid anything to make one.`,
          'When we act on a report we may take the listing down, suspend the seller’s account, and keep the records we hold about it. Where the law requires it, or where it is the right thing to do, we will give those records to the police or other authorities.',
          'If you have already sent money, act quickly: report it to the police, tell your bank or mobile money provider straight away, and then tell us. Speed gives you the best chance of recovering funds, and we will help with the information we hold when properly asked.'
        ]
      },
      {
        heading: 'What you can expect from us',
        paragraphs: [
          'We will run the site with reasonable care and skill, review listings before publishing them, act on reports, be honest about what we have and have not checked, protect your personal data, and tell you when these terms change.'
        ]
      },
      {
        heading: 'What we ask of you',
        paragraphs: [
          'You are responsible for your own decisions, payments and agreements with a seller, landlord or agent, for doing the checks above, and for the accuracy of the details you give us.',
          'We cannot promise the site is always available or that every listing is accurate, because the information in a listing comes from the seller. We are not liable for loss arising out of a transaction we are not part of.',
          'That does not cover our own failures. If we fall short of what we have promised in these terms — for example, by ignoring a report — we are answerable for that as the law provides. Nothing in these terms limits any liability that cannot be limited by law, including for fraud, or for death or personal injury caused by negligence.'
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
          `These terms are governed by the laws of Kenya, and the courts of Kenya have jurisdiction. If something goes wrong, please write to us at ${SUPPORT_EMAIL} first — most things are faster to fix that way. Your rights as a consumer under Kenyan law are not affected by these terms.`
        ]
      }
    ],
    confirmation:
      'I have read and accept these terms. I understand that Tawi Properties does not verify ownership or handle payments between buyers and sellers, and that I should do my own checks before I pay anyone.'
  },

  seller: {
    key: 'seller',
    version: TERMS_VERSION,
    eyebrow: 'For listing a property',
    title: 'Listing on Tawi Properties',
    summary:
      'The short version: you are declaring that this property is yours to advertise, or that you hold the owner’s written authority, and that the details are true. In return we review it, publish it, promote it for a month, keep the fee and refunds clear, and act quickly when something looks wrong. What you agree with a buyer is between the two of you, and we never hold that money.',
    sections: [
      {
        heading: 'What you are declaring about this property',
        paragraphs: [
          'By submitting this listing you are telling us, and everyone who sees it, that:'
        ],
        points: [
          'You are choosing, freely and lawfully, to sell or let this property.',
          'You own it, or you have written authority from the owner to advertise it, and you can show that authority if we ask.',
          'The documents and ownership details you rely on are genuine, and no one has asked you to present them otherwise.',
          'You are not aware of any court order, dispute, charge or restriction that would stop you from selling or letting it, or you have said so in the description.',
          'The price, location, description and photos are accurate as far as you know.',
          'You will update or remove the listing once the property is sold, let, or off the market.'
        ]
      },
      {
        heading: 'What we do for you',
        paragraphs: [
          'We review your listing, tell you the outcome, and if we reject it we tell you why. Once approved, we publish it and feature it for one calendar month. We give you a way to manage it from your account, and a person you can write to if something is not right.',
          'This form does not ask you to upload title documents. If something about a listing looks inconsistent, we may ask you for proof of ownership or authority, and we may pause the listing until you reply.',
          'Once your listing is live you can ask for up to two edits to it through your account, and our team reviews each one. For any change beyond that, contact us with the reason.'
        ]
      },
      {
        heading: 'Your photos and description',
        paragraphs: [
          'They stay yours. You give us permission to display, resize and use them to promote the listing on the site and our own channels for as long as the listing runs, and for a short period afterwards while caches and search results clear.',
          'You confirm the photos are of this property and that you are allowed to use them — not taken from another listing, another agent, or a stock library you have no licence for.'
        ]
      },
      {
        heading: 'The listing fee and how money moves',
        paragraphs: [
          'There are only three money routes connected to your listing. We set them out plainly so that you can recognise anything that does not belong:'
        ],
        points: [
          'You to Tawi Properties: one listing fee per listing, charged before we review it. The amount is shown on the payment screen before you confirm, and it is paid through an M-Pesa prompt sent to the phone number you enter there. You confirm it with your own PIN, on your own phone. Safaricom then sends you an M-Pesa confirmation with a receipt number; please keep it, because it is how we trace your payment if there is ever a question.',
          'Tawi Properties to you: refunds of the listing fee in the cases set out below, and nothing else. Refunds are returned to the M-Pesa number that paid. We do not pay sellers commissions, rewards or “sale proceeds”.',
          'Buyer or tenant to you: the purchase price, rent or deposit is agreed and paid directly between you and them. It does not pass through Tawi Properties, we take no commission or share from it, and we do not hold it or guarantee it.'
        ],
        affirm:
          'We will never ask a seller by phone, WhatsApp, SMS or email for a “verification”, “boost”, “release” or “unlock” fee, or for your M-Pesa PIN or any one-time code. If someone does, in our name, it is not us — please tell us at ' +
          SUPPORT_EMAIL +
          '.'
      },
      {
        heading: 'What the fee is, and is not',
        paragraphs: [
          'It is a placement fee. It is not commission, it is not a deposit, and it does not entitle you to a sale or a tenancy. Once approved, your listing runs as featured for one calendar month from the day we publish it, after which it comes down automatically. You can list it again by paying again.'
        ]
      },
      {
        heading: 'Review, rejection and refunds',
        paragraphs: [
          'We review every submission before it goes live. We will tell you the outcome, and if we reject it we will tell you why.',
          'If we reject your listing for a reason that is not about false, misleading or unauthorised information — for example we cannot support that property type, or there is a problem on our side — we refund the fee in full within 7 working days.',
          'If you pay and your listing then fails to submit because of a fault on our side, we will either get it submitted or refund the fee in full.',
          'If you withdraw the listing before we have reviewed it, we refund it in full. If we reject it because the information or documents you gave were false, misleading or not yours to use, the fee is not refunded.',
          'Once a listing has been published, the fee is not refundable for the remainder of that month, unless we took the listing down by mistake (see below).'
        ]
      },
      {
        heading: 'Staying safe when you sell',
        paragraphs: [
          'We do not screen buyers or tenants, and some of them are not honest. The same care we ask of buyers applies to you, because sellers are targeted too:'
        ],
        points: [
          'Confirm that the money has cleared in your bank or your advocate’s client account before you hand over keys, original title documents or a signed transfer. A screenshot or an SMS is not proof.',
          'Be wary of overpayments, and of anyone who sends too much and asks you to refund the difference.',
          'Do not pay a “viewing”, “processing” or “facilitation” fee to anyone, including someone claiming to be a buyer, an official, or us, in order to complete a sale.',
          'Keep original title documents and ID with you. Give certified copies where copies are needed.',
          'Use an advocate for the sale or tenancy agreement, and have deposits held in the advocate’s client account.',
          'For viewings, meet at the property in daylight, take someone with you, and share only the details you need to share.'
        ],
        affirm:
          'I understand that Tawi Properties does not vet buyers or hold sale money, and that I should confirm payment has cleared before I hand anything over.'
      },
      {
        heading: 'Your contact details are published',
        paragraphs: [
          'The phone number and email on this form are shown on the listing so buyers and tenants can reach you. Signed-in users see them in full; visitors who are not signed in see a partly hidden number and no email. Do not put a number here that you are not happy to publish.',
          'Enquiries come from individual people, and we do not screen them. If someone contacts you in a way that feels abusive or suspicious, tell us and we will look into it.'
        ]
      },
      {
        heading: 'How we ask you to use the listing',
        paragraphs: [
          'Please do not list a property that is not yours or not available, list the same property twice at the same time, use a price you do not intend to honour to attract enquiries, or use a listing to collect money from people for something that does not exist. Listings must not discriminate unlawfully against anyone.'
        ]
      },
      {
        heading: 'If we take a listing down',
        paragraphs: [
          'We can remove a listing, or suspend an account, if it breaks these terms, if we have good reason to suspect fraud, or if we are required to by law. If we suspect fraud we may hold a listing while we look into it, and where the law requires it we will share what we hold with the police or other authorities.',
          `We will tell you the reason. If you think we got it wrong, reply to that message or write to ${SUPPORT_EMAIL} within 14 days and a person will look at it again. If the removal turns out to have been our mistake, we will republish the listing for the time it lost, or refund the fee.`
        ]
      },
      {
        heading: 'What you can expect from us',
        paragraphs: [
          'We will review, publish and promote your listing as described here. We will keep the fee, the refunds and the way money moves clear and exactly as written. We will act on reports about your listing fairly, tell you the reason if we take it down, protect your personal data, and give you notice of changes to these terms.'
        ]
      },
      {
        heading: 'What we ask of you',
        paragraphs: [
          'We are not your agent and we are not a party to any sale or tenancy you agree. We do not negotiate for you, hold money for you, or guarantee that anyone will buy or rent.',
          'You deal with buyers and tenants directly, and you are responsible for what you publish here. If someone brings a claim against us because information you gave was false, unauthorised or not yours to use, you will cover the direct losses and reasonable legal costs that claim causes us. That applies only to claims arising from your own listing, and not where the problem was caused by us.',
          'In the same spirit, if we get something wrong, we will put it right. Nothing in these terms limits liability that cannot be limited by law, including for fraud, or for death or personal injury caused by negligence.'
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
          `These terms are governed by the laws of Kenya, and the courts of Kenya have jurisdiction. Please write to ${SUPPORT_EMAIL} before taking anything further. Your rights as a consumer under Kenyan law are not affected by these terms.`
        ]
      }
    ],
    confirmation:
      'I confirm I have the right to advertise this property, that the details I have given are accurate, and that I accept these seller terms, including how the listing fee and refunds work.'
  }
}

export function getTerms(audience) {
  return TERMS[audience] || TERMS.general
}

export default TERMS