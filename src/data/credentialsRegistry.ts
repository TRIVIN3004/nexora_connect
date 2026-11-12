export type CredentialType =
  | 'INTERNSHIP_CERTIFICATE'
  | 'EXPERIENCE_CERTIFICATE'
  | 'OFFER_LETTER';

export interface VerifiedCredentialRecord {
  refId: string;
  altRefIds?: string[];
  type: CredentialType;
  typeLabel: string;
  candidateName: string;
  candidateEmail?: string;
  regNo?: string;
  domain: string;
  designation: string;
  duration: string;
  tenurePeriod: string;
  issueDate: string;
  rating: string;
  signatory: string;
  organization: string;
  pdfUrl: string;
  htmlUrl?: string;
  status: 'VERIFIED';
}

const ORG_NAME = 'Gonexora Techs Private Limited (MSME Registered • Govt. of India)';
const SIGNATORY = 'TRIVIN S — Founder & Lead Administrator, Head of Executive Operations & HR';

export const CREDENTIALS_REGISTRY: VerifiedCredentialRecord[] = [
  // =========================================================================
  // MADONA
  // =========================================================================
  {
    refId: 'GT/INT/2026/CDO-093',
    altRefIds: ['https://connect.nexoratechs.xyz/certificates/madona_internship_certificate.html'],
    type: 'INTERNSHIP_CERTIFICATE',
    typeLabel: 'Internship Completion Certificate',
    candidateName: 'Madona',
    candidateEmail: 'krmadona23@gmail.com',
    domain: 'Cloud DevOps',
    designation: 'Cloud DevOps Engineer',
    duration: '3 Months',
    tenurePeriod: 'August 01, 2026 – October 31, 2026',
    issueDate: 'November 12, 2026',
    rating: 'Grade A+ (Exemplary)',
    signatory: SIGNATORY,
    organization: ORG_NAME,
    pdfUrl: '/certificates/Gonexora_Techs_Internship_Certificate_Madona.pdf',
    htmlUrl: '/certificates/madona_internship_certificate.html',
    status: 'VERIFIED',
  },
  {
    refId: 'GT/EXP/2026/CDO-093',
    altRefIds: ['https://connect.nexoratechs.xyz/certificates/madona_experience_certificate.html'],
    type: 'EXPERIENCE_CERTIFICATE',
    typeLabel: 'Work Experience Certificate & Relieving Letter',
    candidateName: 'Madona',
    candidateEmail: 'krmadona23@gmail.com',
    domain: 'Cloud DevOps',
    designation: 'Cloud DevOps Engineer',
    duration: '3 Months',
    tenurePeriod: 'August 01, 2026 – October 31, 2026',
    issueDate: 'November 12, 2026',
    rating: 'Grade A+ (Exemplary)',
    signatory: SIGNATORY,
    organization: ORG_NAME,
    pdfUrl: '/certificates/Gonexora_Techs_Experience_Certificate_Madona.pdf',
    htmlUrl: '/certificates/madona_experience_certificate.html',
    status: 'VERIFIED',
  },

  // =========================================================================
  // NIDIYA RAJ KADAVAN
  // =========================================================================
  {
    refId: 'GT/INT/2026/FSD-092',
    type: 'INTERNSHIP_CERTIFICATE',
    typeLabel: 'Internship Completion Certificate',
    candidateName: 'Nidiya Raj Kadavan',
    candidateEmail: 'nidiyarajkadavan@gmail.com',
    domain: 'Full Stack Development',
    designation: 'Full Stack Developer',
    duration: '3 Months',
    tenurePeriod: 'August 01, 2026 – October 31, 2026',
    issueDate: 'November 12, 2026',
    rating: 'Grade A+ (Exemplary)',
    signatory: SIGNATORY,
    organization: ORG_NAME,
    pdfUrl: '/certificates/Gonexora_Techs_Internship_Certificate_Nidiya_Raj_Kadavan.pdf',
    status: 'VERIFIED',
  },
  {
    refId: 'GT/EXP/2026/FSD-092',
    type: 'EXPERIENCE_CERTIFICATE',
    typeLabel: 'Work Experience Certificate & Relieving Letter',
    candidateName: 'Nidiya Raj Kadavan',
    candidateEmail: 'nidiyarajkadavan@gmail.com',
    domain: 'Full Stack Development',
    designation: 'Full Stack Developer',
    duration: '3 Months',
    tenurePeriod: 'August 01, 2026 – October 31, 2026',
    issueDate: 'November 12, 2026',
    rating: 'Grade A+ (Exemplary)',
    signatory: SIGNATORY,
    organization: ORG_NAME,
    pdfUrl: '/certificates/Gonexora_Techs_Experience_Certificate_Nidiya_Raj_Kadavan.pdf',
    status: 'VERIFIED',
  },

  // =========================================================================
  // SHAKTHI J
  // =========================================================================
  {
    refId: 'GT/INT/2026/DA-055',
    type: 'INTERNSHIP_CERTIFICATE',
    typeLabel: 'Internship Completion Certificate',
    candidateName: 'Shakthi J',
    candidateEmail: 'shakthij2004@gmail.com',
    domain: 'Data Analytics',
    designation: 'Data Analyst',
    duration: '3 Months',
    tenurePeriod: 'August 01, 2026 – October 31, 2026',
    issueDate: 'November 06, 2026',
    rating: 'Grade A+ (Exemplary)',
    signatory: SIGNATORY,
    organization: ORG_NAME,
    pdfUrl: '/certificates/Gonexora_Techs_Internship_Certificate_Shakthi_J.pdf',
    htmlUrl: '/certificates/shakthi_j_internship_certificate.html',
    status: 'VERIFIED',
  },
  {
    refId: 'GT/EXP/2026/DA-055',
    type: 'EXPERIENCE_CERTIFICATE',
    typeLabel: 'Work Experience Certificate & Relieving Letter',
    candidateName: 'Shakthi J',
    candidateEmail: 'shakthij2004@gmail.com',
    domain: 'Data Analytics',
    designation: 'Data Analyst',
    duration: '3 Months',
    tenurePeriod: 'August 01, 2026 – October 31, 2026',
    issueDate: 'November 06, 2026',
    rating: 'Grade A+ (Exemplary)',
    signatory: SIGNATORY,
    organization: ORG_NAME,
    pdfUrl: '/certificates/Gonexora_Techs_Experience_Certificate_Shakthi_J.pdf',
    htmlUrl: '/certificates/shakthi_j_experience_certificate.html',
    status: 'VERIFIED',
  },

  // =========================================================================
  // SHARON
  // =========================================================================
  {
    refId: 'GT/INT/2026/FSD-088',
    altRefIds: ['https://connect.nexoratechs.xyz/certificates/sharon_internship_certificate.html'],
    type: 'INTERNSHIP_CERTIFICATE',
    typeLabel: 'Internship Completion Certificate',
    candidateName: 'Sharon',
    candidateEmail: 'angelsharon283@gmail.com',
    domain: 'Full Stack Development',
    designation: 'Full Stack Developer',
    duration: '3 Months',
    tenurePeriod: 'August 01, 2026 – October 31, 2026',
    issueDate: 'November 03, 2026',
    rating: 'Grade A+ (Exemplary)',
    signatory: SIGNATORY,
    organization: ORG_NAME,
    pdfUrl: '/certificates/Gonexora_Techs_Internship_Certificate_Sharon.pdf',
    htmlUrl: '/certificates/sharon_internship_certificate.html',
    status: 'VERIFIED',
  },
  {
    refId: 'GT/EXP/2026/FSD-088',
    altRefIds: ['https://connect.nexoratechs.xyz/certificates/sharon_experience_certificate.html'],
    type: 'EXPERIENCE_CERTIFICATE',
    typeLabel: 'Work Experience Certificate & Relieving Letter',
    candidateName: 'Sharon',
    candidateEmail: 'angelsharon283@gmail.com',
    domain: 'Full Stack Development',
    designation: 'Full Stack Developer',
    duration: '3 Months',
    tenurePeriod: 'August 01, 2026 – October 31, 2026',
    issueDate: 'November 03, 2026',
    rating: 'Grade A+ (Exemplary)',
    signatory: SIGNATORY,
    organization: ORG_NAME,
    pdfUrl: '/certificates/Gonexora_Techs_Experience_Certificate_Sharon.pdf',
    htmlUrl: '/certificates/sharon_experience_certificate.html',
    status: 'VERIFIED',
  },

  // =========================================================================
  // SARANYA.S
  // =========================================================================
  {
    refId: 'GT/INT/2026/019',
    altRefIds: ['NT/INT/2026/019'],
    type: 'INTERNSHIP_CERTIFICATE',
    typeLabel: 'Internship Completion Certificate',
    candidateName: 'SARANYA.S',
    candidateEmail: 'saranyassaro3@gmail.com',
    regNo: '210623243046',
    domain: 'Data Science',
    designation: 'Data Scientist',
    duration: '3 Months',
    tenurePeriod: 'August 01, 2026 – October 31, 2026',
    issueDate: 'November 06, 2026',
    rating: 'Grade A+ (Exemplary)',
    signatory: SIGNATORY,
    organization: ORG_NAME,
    pdfUrl: '/certificates/Gonexora_Techs_Internship_Certificate_SARANYAS.pdf',
    htmlUrl: '/certificates/saranya_internship_certificate.html',
    status: 'VERIFIED',
  },
  {
    refId: 'GT/EXP/2026/DS-019',
    type: 'EXPERIENCE_CERTIFICATE',
    typeLabel: 'Work Experience Certificate & Relieving Letter',
    candidateName: 'SARANYA.S',
    candidateEmail: 'saranyassaro3@gmail.com',
    regNo: '210623243046',
    domain: 'Data Science',
    designation: 'Data Scientist',
    duration: '3 Months',
    tenurePeriod: 'August 01, 2026 – October 31, 2026',
    issueDate: 'November 06, 2026',
    rating: 'Grade A+ (Exemplary)',
    signatory: SIGNATORY,
    organization: ORG_NAME,
    pdfUrl: '/certificates/Gonexora_Techs_Experience_Certificate_SARANYAS.pdf',
    htmlUrl: '/certificates/saranya_experience_certificate.html',
    status: 'VERIFIED',
  },
  {
    refId: 'NT/INT/2026/019',
    type: 'OFFER_LETTER',
    typeLabel: 'Internship Offer Letter',
    candidateName: 'SARANYA.S',
    candidateEmail: 'saranyassaro3@gmail.com',
    regNo: '210623243046',
    domain: 'Data Science',
    designation: 'Data Science Intern',
    duration: '3 Months',
    tenurePeriod: 'August 01, 2026 – November 30, 2026',
    issueDate: 'July 17, 2026',
    rating: 'Selected Candidate',
    signatory: 'HR Department — Gonexora Techs / Nexora Technologies',
    organization: ORG_NAME,
    pdfUrl: '/certificates/Nexora_Technologies_Internship_Offer_Letter_SARANYAS.pdf',
    status: 'VERIFIED',
  },

  // =========================================================================
  // JOBI SHERINA J S
  // =========================================================================
  {
    refId: 'GT/INT/2026/021',
    altRefIds: ['NT/INT/2026/021'],
    type: 'INTERNSHIP_CERTIFICATE',
    typeLabel: 'Internship Completion Certificate',
    candidateName: 'Jobi Sherina J S',
    candidateEmail: 'jobijohny27@gmail.com',
    domain: 'UI/UX Design',
    designation: 'UI/UX Designer',
    duration: '3 Months',
    tenurePeriod: 'August 01, 2026 – October 31, 2026',
    issueDate: 'November 06, 2026',
    rating: 'Grade A+ (Exemplary)',
    signatory: SIGNATORY,
    organization: ORG_NAME,
    pdfUrl: '/certificates/Gonexora_Techs_Internship_Certificate_Jobi_Sherina_J_S.pdf',
    htmlUrl: '/certificates/jobi_sherina_internship_certificate.html',
    status: 'VERIFIED',
  },
  {
    refId: 'GT/EXP/2026/UIUX-021',
    type: 'EXPERIENCE_CERTIFICATE',
    typeLabel: 'Work Experience Certificate & Relieving Letter',
    candidateName: 'Jobi Sherina J S',
    candidateEmail: 'jobijohny27@gmail.com',
    domain: 'UI/UX Design',
    designation: 'UI/UX Designer',
    duration: '3 Months',
    tenurePeriod: 'August 01, 2026 – October 31, 2026',
    issueDate: 'November 06, 2026',
    rating: 'Grade A+ (Exemplary)',
    signatory: SIGNATORY,
    organization: ORG_NAME,
    pdfUrl: '/certificates/Gonexora_Techs_Experience_Certificate_Jobi_Sherina_J_S.pdf',
    htmlUrl: '/certificates/jobi_sherina_experience_certificate.html',
    status: 'VERIFIED',
  },
  {
    refId: 'NT/INT/2026/021',
    type: 'OFFER_LETTER',
    typeLabel: 'Internship Offer Letter',
    candidateName: 'Jobi Sherina J S',
    candidateEmail: 'jobijohny27@gmail.com',
    domain: 'UI/UX Design',
    designation: 'UI/UX Designer Intern',
    duration: '3 Months',
    tenurePeriod: 'August 01, 2026 – November 30, 2026',
    issueDate: 'July 17, 2026',
    rating: 'Selected Candidate',
    signatory: 'HR Department — Gonexora Techs / Nexora Technologies',
    organization: ORG_NAME,
    pdfUrl: '/certificates/Nexora_Technologies_Internship_Offer_Letter_Jobi_Sherina.pdf',
    status: 'VERIFIED',
  },

  // =========================================================================
  // RAGUL KUMAR & AKSHAYA R (SPECIAL CERTIFICATES)
  // =========================================================================
  {
    refId: 'GT/INT/2026/BA-012',
    altRefIds: [
      'https://www.connect.nexoratechs.xyz/certificates/ragul_kumar_internship_certificate.html',
      'https://connect.nexoratechs.xyz/certificates/ragul_kumar_internship_certificate.html',
    ],
    type: 'INTERNSHIP_CERTIFICATE',
    typeLabel: 'Internship Completion Certificate',
    candidateName: 'Ragul Kumar',
    domain: 'Business Analyst',
    designation: 'Business Analyst',
    duration: '2 Weeks',
    tenurePeriod: 'October 01, 2026 – October 15, 2026',
    issueDate: 'October 23, 2026',
    rating: 'Grade A+ (Exemplary)',
    signatory: SIGNATORY,
    organization: ORG_NAME,
    pdfUrl: '/certificates/Ragul_Kumar_Internship_Certificate.pdf',
    htmlUrl: '/certificates/ragul_kumar_internship_certificate.html',
    status: 'VERIFIED',
  },
  {
    refId: 'NEX-EXP-2026-AK8921',
    type: 'EXPERIENCE_CERTIFICATE',
    typeLabel: 'Work Experience Certificate & Relieving Letter',
    candidateName: 'Akshaya R',
    candidateEmail: 'akshuraj2005@gmail.com',
    regNo: '210623243006',
    domain: 'Software Engineering',
    designation: 'Software Associate',
    duration: '2 Months',
    tenurePeriod: 'July 01, 2026 – August 31, 2026',
    issueDate: 'September 03, 2026',
    rating: 'Satisfactory Completion',
    signatory: SIGNATORY,
    organization: ORG_NAME,
    pdfUrl: '/certificates/Akshaya_R_Experience_Certificate.pdf',
    htmlUrl: '/certificates/NEX-EXP-2026-AK8921.html',
    status: 'VERIFIED',
  },

  // =========================================================================
  // BATCH INTERNSHIP CANDIDATES (candidates.json)
  // =========================================================================
  {
    refId: 'GT/INT/2026/032',
    altRefIds: ['NT/INT/2026/032'],
    type: 'INTERNSHIP_CERTIFICATE',
    typeLabel: 'Internship Completion Certificate',
    candidateName: 'Ajay kumar D',
    candidateEmail: 'ajay872072@gmail.com',
    domain: 'Artificial Intelligence and Machine Learning',
    designation: 'AI/ML Intern',
    duration: '3 Months',
    tenurePeriod: 'August 01, 2026 – October 30, 2026',
    issueDate: 'November 06, 2026',
    rating: 'Grade A+ (Exemplary)',
    signatory: SIGNATORY,
    organization: ORG_NAME,
    pdfUrl: '/certificates/Gonexora_Techs_Internship_Certificate_Ajay_kumar_D.pdf',
    status: 'VERIFIED',
  },
  {
    refId: 'GT/INT/2026/011',
    altRefIds: ['NT/INT/2026/011'],
    type: 'INTERNSHIP_CERTIFICATE',
    typeLabel: 'Internship Completion Certificate',
    candidateName: 'AKSHAYA R',
    candidateEmail: 'akshuraj2005@gmail.com',
    regNo: '210623243006',
    domain: 'Artificial Intelligence and Machine Learning',
    designation: 'AI/ML Intern',
    duration: '2 Months',
    tenurePeriod: 'August 01, 2026 – September 30, 2026',
    issueDate: 'November 06, 2026',
    rating: 'Grade A+ (Exemplary)',
    signatory: SIGNATORY,
    organization: ORG_NAME,
    pdfUrl: '/certificates/Gonexora_Techs_Internship_Certificate_AKSHAYA_R.pdf',
    status: 'VERIFIED',
  },
  {
    refId: 'GT/INT/2026/016',
    altRefIds: ['NT/INT/2026/016'],
    type: 'INTERNSHIP_CERTIFICATE',
    typeLabel: 'Internship Completion Certificate',
    candidateName: 'T D Amirthavarshini',
    candidateEmail: 'amirthavarshinitd@gmail.com',
    regNo: '210623243007',
    domain: 'Full Stack Developer',
    designation: 'Full Stack Developer Intern',
    duration: '3 Months',
    tenurePeriod: 'August 01, 2026 – November 30, 2026',
    issueDate: 'November 06, 2026',
    rating: 'Grade A+ (Exemplary)',
    signatory: SIGNATORY,
    organization: ORG_NAME,
    pdfUrl: '/certificates/Gonexora_Techs_Internship_Certificate_T_D_Amirthavarshini.pdf',
    status: 'VERIFIED',
  },
  {
    refId: 'GT/INT/2026/042',
    altRefIds: ['NT/INT/2026/042'],
    type: 'INTERNSHIP_CERTIFICATE',
    typeLabel: 'Internship Completion Certificate',
    candidateName: 'Arasu M',
    candidateEmail: 'arasu2005@gmail.com',
    domain: 'Data Science',
    designation: 'Data Science Intern',
    duration: '2 Months',
    tenurePeriod: 'August 01, 2026 – October 30, 2026',
    issueDate: 'November 06, 2026',
    rating: 'Grade A+ (Exemplary)',
    signatory: SIGNATORY,
    organization: ORG_NAME,
    pdfUrl: '/certificates/Gonexora_Techs_Internship_Certificate_Arasu_M.pdf',
    status: 'VERIFIED',
  },
  {
    refId: 'GT/INT/2026/106',
    altRefIds: ['NT/INT/2026/106'],
    type: 'INTERNSHIP_CERTIFICATE',
    typeLabel: 'Internship Completion Certificate',
    candidateName: 'Betshiya S.G',
    candidateEmail: 'betshiya2005@gmail.com',
    regNo: '210623243012',
    domain: 'Data Analytics',
    designation: 'Data Analytics Intern',
    duration: '3 Months',
    tenurePeriod: 'August 01, 2026 – November 30, 2026',
    issueDate: 'November 06, 2026',
    rating: 'Grade A+ (Exemplary)',
    signatory: SIGNATORY,
    organization: ORG_NAME,
    pdfUrl: '/certificates/Gonexora_Techs_Internship_Certificate_Betshiya_SG.pdf',
    status: 'VERIFIED',
  },
  {
    refId: 'GT/INT/2026/034',
    altRefIds: ['NT/INT/2026/034'],
    type: 'INTERNSHIP_CERTIFICATE',
    typeLabel: 'Internship Completion Certificate',
    candidateName: 'Bharath G',
    candidateEmail: 'bharathgandhi92@gmail.com',
    domain: 'Artificial Intelligence and Machine Learning',
    designation: 'AI/ML Intern',
    duration: '3 Months',
    tenurePeriod: 'August 01, 2026 – October 30, 2026',
    issueDate: 'November 06, 2026',
    rating: 'Grade A+ (Exemplary)',
    signatory: SIGNATORY,
    organization: ORG_NAME,
    pdfUrl: '/certificates/Gonexora_Techs_Internship_Certificate_Bharath_G.pdf',
    status: 'VERIFIED',
  },
  {
    refId: 'GT/INT/2026/035',
    altRefIds: ['NT/INT/2026/035'],
    type: 'INTERNSHIP_CERTIFICATE',
    typeLabel: 'Internship Completion Certificate',
    candidateName: 'Joel M',
    candidateEmail: 'joel21026@gmail.com',
    domain: 'Artificial Intelligence and Machine Learning',
    designation: 'AI/ML Intern',
    duration: '3 Months',
    tenurePeriod: 'August 01, 2026 – October 30, 2026',
    issueDate: 'November 06, 2026',
    rating: 'Grade A+ (Exemplary)',
    signatory: SIGNATORY,
    organization: ORG_NAME,
    pdfUrl: '/certificates/Gonexora_Techs_Internship_Certificate_Joel_M.pdf',
    status: 'VERIFIED',
  },
  {
    refId: 'GT/INT/2026/035',
    altRefIds: ['NT/INT/2026/035'],
    type: 'INTERNSHIP_CERTIFICATE',
    typeLabel: 'Internship Completion Certificate',
    candidateName: 'Karthikeyan M',
    candidateEmail: 'karthikeyan21026@gmail.com',
    domain: 'Artificial Intelligence and Machine Learning',
    designation: 'AI/ML Intern',
    duration: '3 Months',
    tenurePeriod: 'August 01, 2026 – October 30, 2026',
    issueDate: 'November 06, 2026',
    rating: 'Grade A+ (Exemplary)',
    signatory: SIGNATORY,
    organization: ORG_NAME,
    pdfUrl: '/certificates/Gonexora_Techs_Internship_Certificate_Karthikeyan_M.pdf',
    status: 'VERIFIED',
  },
  {
    refId: 'GT/INT/2026/031',
    altRefIds: ['NT/INT/2026/031'],
    type: 'INTERNSHIP_CERTIFICATE',
    typeLabel: 'Internship Completion Certificate',
    candidateName: 'Keerthivasan',
    candidateEmail: 'keerthivasan30112005@gmail.com',
    domain: 'Artificial Intelligence and Machine Learning',
    designation: 'AI/ML Intern',
    duration: '3 Months',
    tenurePeriod: 'August 01, 2026 – October 30, 2026',
    issueDate: 'November 06, 2026',
    rating: 'Grade A+ (Exemplary)',
    signatory: SIGNATORY,
    organization: ORG_NAME,
    pdfUrl: '/certificates/Gonexora_Techs_Internship_Certificate_Keerthivasan.pdf',
    status: 'VERIFIED',
  },
  {
    refId: 'GT/INT/2026/118',
    altRefIds: ['NT/INT/2026/118'],
    type: 'INTERNSHIP_CERTIFICATE',
    typeLabel: 'Internship Completion Certificate',
    candidateName: 'S.V Naveen',
    candidateEmail: 'naveensv0112@gmail.com',
    regNo: '210623243039',
    domain: 'UI/UX Designer',
    designation: 'UI/UX Designer Intern',
    duration: '3 Months',
    tenurePeriod: 'August 01, 2026 – October 30, 2026',
    issueDate: 'November 06, 2026',
    rating: 'Grade A+ (Exemplary)',
    signatory: SIGNATORY,
    organization: ORG_NAME,
    pdfUrl: '/certificates/Gonexora_Techs_Internship_Certificate_SV_Naveen.pdf',
    status: 'VERIFIED',
  },
  {
    refId: 'GT/INT/2026/051',
    altRefIds: ['NT/INT/2026/051'],
    type: 'INTERNSHIP_CERTIFICATE',
    typeLabel: 'Internship Completion Certificate',
    candidateName: 'Pavithraa S',
    candidateEmail: 'pavithraayohan@gmail.com',
    regNo: '210623104079',
    domain: 'Data Science',
    designation: 'Data Science Intern',
    duration: '3 Months',
    tenurePeriod: 'August 10, 2026 – November 10, 2026',
    issueDate: 'November 06, 2026',
    rating: 'Grade A+ (Exemplary)',
    signatory: SIGNATORY,
    organization: ORG_NAME,
    pdfUrl: '/certificates/Gonexora_Techs_Internship_Certificate_Pavithraa_S.pdf',
    status: 'VERIFIED',
  },
  {
    refId: 'GT/INT/2026/108',
    altRefIds: ['NT/INT/2026/108'],
    type: 'INTERNSHIP_CERTIFICATE',
    typeLabel: 'Internship Completion Certificate',
    candidateName: 'Sangamithra K',
    candidateEmail: 'sangamithrakesavan8@gmail.com',
    regNo: '210623243043',
    domain: 'DevOps and Cloud',
    designation: 'DevOps & Cloud Intern',
    duration: '3 Months',
    tenurePeriod: 'August 01, 2026 – November 30, 2026',
    issueDate: 'November 06, 2026',
    rating: 'Grade A+ (Exemplary)',
    signatory: SIGNATORY,
    organization: ORG_NAME,
    pdfUrl: '/certificates/Gonexora_Techs_Internship_Certificate_Sangamithra_K.pdf',
    status: 'VERIFIED',
  },
  {
    refId: 'GT/INT/2026/113',
    altRefIds: ['NT/INT/2026/113'],
    type: 'INTERNSHIP_CERTIFICATE',
    typeLabel: 'Internship Completion Certificate',
    candidateName: 'Sanjay kumar V',
    candidateEmail: 'sanjayvijay20051512@gmail.com',
    regNo: '210623243044',
    domain: 'Artificial Intelligence and Machine Learning',
    designation: 'AI/ML Intern',
    duration: '3 Months',
    tenurePeriod: 'August 01, 2026 – October 30, 2026',
    issueDate: 'November 06, 2026',
    rating: 'Grade A+ (Exemplary)',
    signatory: SIGNATORY,
    organization: ORG_NAME,
    pdfUrl: '/certificates/Gonexora_Techs_Internship_Certificate_Sanjay_kumar_V.pdf',
    status: 'VERIFIED',
  },
  {
    refId: 'GT/INT/2026/053',
    altRefIds: ['NT/INT/2026/053'],
    type: 'INTERNSHIP_CERTIFICATE',
    typeLabel: 'Internship Completion Certificate',
    candidateName: 'Sujitha.S',
    candidateEmail: 'ssujitha9307@gmail.com',
    regNo: '210624104167',
    domain: 'Full Stack Developer',
    designation: 'Full Stack Developer Intern',
    duration: '3 Months',
    tenurePeriod: 'August 10, 2026 – November 10, 2026',
    issueDate: 'November 06, 2026',
    rating: 'Grade A+ (Exemplary)',
    signatory: SIGNATORY,
    organization: ORG_NAME,
    pdfUrl: '/certificates/Gonexora_Techs_Internship_Certificate_SujithaS.pdf',
    status: 'VERIFIED',
  },
  {
    refId: 'GT/INT/2026/014',
    altRefIds: ['NT/INT/2026/014'],
    type: 'INTERNSHIP_CERTIFICATE',
    typeLabel: 'Internship Completion Certificate',
    candidateName: 'T. Aarthi',
    candidateEmail: 'aarthi94428@gmail.com',
    regNo: '210623243001',
    domain: 'Artificial Intelligence',
    designation: 'Artificial Intelligence Intern',
    duration: '3 Months',
    tenurePeriod: 'August 01, 2026 – October 30, 2026',
    issueDate: 'November 06, 2026',
    rating: 'Grade A+ (Exemplary)',
    signatory: SIGNATORY,
    organization: ORG_NAME,
    pdfUrl: '/certificates/Gonexora_Techs_Internship_Certificate_T_Aarthi.pdf',
    status: 'VERIFIED',
  },
  {
    refId: 'GT/INT/2026/012',
    altRefIds: ['NT/INT/2026/012'],
    type: 'INTERNSHIP_CERTIFICATE',
    typeLabel: 'Internship Completion Certificate',
    candidateName: 'T.Ananthi',
    candidateEmail: 'ananthi877831@gmail.com',
    regNo: '210623243008',
    domain: 'Artificial Intelligence',
    designation: 'Artificial Intelligence Intern',
    duration: '3 Months',
    tenurePeriod: 'August 01, 2026 – October 30, 2026',
    issueDate: 'November 06, 2026',
    rating: 'Grade A+ (Exemplary)',
    signatory: SIGNATORY,
    organization: ORG_NAME,
    pdfUrl: '/certificates/Gonexora_Techs_Internship_Certificate_TAnanthi.pdf',
    status: 'VERIFIED',
  },
  {
    refId: 'GT/INT/2026/033',
    altRefIds: ['NT/INT/2026/033'],
    type: 'INTERNSHIP_CERTIFICATE',
    typeLabel: 'Internship Completion Certificate',
    candidateName: 'Vishnu Hasan R',
    candidateEmail: 'vishnu30426@gmail.com',
    domain: 'Data Science',
    designation: 'Data Science Intern',
    duration: '3 Months',
    tenurePeriod: 'August 01, 2026 – October 30, 2026',
    issueDate: 'November 06, 2026',
    rating: 'Grade A+ (Exemplary)',
    signatory: SIGNATORY,
    organization: ORG_NAME,
    pdfUrl: '/certificates/Gonexora_Techs_Internship_Certificate_Vishnu_Hasan_R.pdf',
    status: 'VERIFIED',
  },
];

/**
 * Extracts a reference ID or certificate path from a raw QR payload or user query.
 */
export function extractCredentialIdentifier(rawInput: string): string {
  const trimmed = rawInput.trim();
  if (!trimmed) return '';

  // Handle full URLs (e.g., https://connect.nexoratechs.xyz/?verify=GT/INT/2026/FSD-092 or .../certificates/sharon_experience_certificate.html)
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    try {
      const url = new URL(trimmed);
      const paramRef =
        url.searchParams.get('verify') ||
        url.searchParams.get('ref') ||
        url.searchParams.get('id');
      if (paramRef) {
        return paramRef.trim();
      }
      if (url.pathname && url.pathname !== '/') {
        return url.pathname.trim();
      }
    } catch {
      // Fall back to raw string matching
    }
  }

  return trimmed;
}

/**
 * Resolves any QR scan payload, URL, Reference ID, candidate name, or email against the official registry.
 */
export function resolveVerificationQuery(rawInput: string): {
  extractedQuery: string;
  matches: VerifiedCredentialRecord[];
} {
  const extracted = extractCredentialIdentifier(rawInput);
  if (!extracted) {
    return { extractedQuery: '', matches: [] };
  }

  const normalized = extracted.toLowerCase();
  const normalizedRaw = rawInput.trim().toLowerCase();

  // 1. Exact Ref ID, Alt Ref ID, HTML path, or PDF path match
  const exactMatches = CREDENTIALS_REGISTRY.filter((rec) => {
    if (rec.refId.toLowerCase() === normalized) return true;
    if (rec.altRefIds?.some((alt) => alt.toLowerCase() === normalized || alt.toLowerCase() === normalizedRaw)) {
      return true;
    }
    if (rec.htmlUrl && (rec.htmlUrl.toLowerCase() === normalized || normalizedRaw.endsWith(rec.htmlUrl.toLowerCase()))) {
      return true;
    }
    if (rec.pdfUrl.toLowerCase() === normalized || normalizedRaw.endsWith(rec.pdfUrl.toLowerCase())) {
      return true;
    }
    return false;
  });

  if (exactMatches.length > 0) {
    return { extractedQuery: extracted, matches: exactMatches };
  }

  // 2. Partial search by Ref ID, Candidate Name, Email, or Reg No (minimum 3 chars)
  if (normalized.length >= 3) {
    const partialMatches = CREDENTIALS_REGISTRY.filter(
      (rec) =>
        rec.refId.toLowerCase().includes(normalized) ||
        rec.candidateName.toLowerCase().includes(normalized) ||
        (rec.candidateEmail && rec.candidateEmail.toLowerCase().includes(normalized)) ||
        (rec.regNo && rec.regNo.toLowerCase().includes(normalized)) ||
        (rec.altRefIds && rec.altRefIds.some((a) => a.toLowerCase().includes(normalized)))
    );
    return { extractedQuery: extracted, matches: partialMatches };
  }

  return { extractedQuery: extracted, matches: [] };
}

