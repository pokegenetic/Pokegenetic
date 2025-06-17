// Country codes with phone number formatting information
export interface CountryCode {
  code: string;
  name: string;
  flag: string;
  placeholder: string;
  dialCode: string;
}

const countryCodes: CountryCode[] = [
  {
    code: 'ES',
    name: 'España',
    flag: '🇪🇸',
    placeholder: '612 345 678',
    dialCode: '+34'
  },
  {
    code: 'US',
    name: 'Estados Unidos',
    flag: '🇺🇸',
    placeholder: '(555) 123-4567',
    dialCode: '+1'
  },
  {
    code: 'MX',
    name: 'México',
    flag: '🇲🇽',
    placeholder: '55 1234 5678',
    dialCode: '+52'
  },
  {
    code: 'AR',
    name: 'Argentina',
    flag: '🇦🇷',
    placeholder: '11 1234-5678',
    dialCode: '+54'
  },
  {
    code: 'CL',
    name: 'Chile',
    flag: '🇨🇱',
    placeholder: '9 1234 5678',
    dialCode: '+56'
  },
  {
    code: 'CO',
    name: 'Colombia',
    flag: '🇨🇴',
    placeholder: '300 123 4567',
    dialCode: '+57'
  },
  {
    code: 'PE',
    name: 'Perú',
    flag: '🇵🇪',
    placeholder: '912 345 678',
    dialCode: '+51'
  },
  {
    code: 'VE',
    name: 'Venezuela',
    flag: '🇻🇪',
    placeholder: '412-1234567',
    dialCode: '+58'
  },
  {
    code: 'EC',
    name: 'Ecuador',
    flag: '🇪🇨',
    placeholder: '99 123 4567',
    dialCode: '+593'
  },
  {
    code: 'UY',
    name: 'Uruguay',
    flag: '🇺🇾',
    placeholder: '91 234 567',
    dialCode: '+598'
  },
  {
    code: 'PY',
    name: 'Paraguay',
    flag: '🇵🇾',
    placeholder: '961 123456',
    dialCode: '+595'
  },
  {
    code: 'BO',
    name: 'Bolivia',
    flag: '🇧🇴',
    placeholder: '7123 4567',
    dialCode: '+591'
  },
  {
    code: 'FR',
    name: 'Francia',
    flag: '🇫🇷',
    placeholder: '06 12 34 56 78',
    dialCode: '+33'
  },
  {
    code: 'DE',
    name: 'Alemania',
    flag: '🇩🇪',
    placeholder: '0151 12345678',
    dialCode: '+49'
  },
  {
    code: 'IT',
    name: 'Italia',
    flag: '🇮🇹',
    placeholder: '312 345 6789',
    dialCode: '+39'
  },
  {
    code: 'GB',
    name: 'Reino Unido',
    flag: '🇬🇧',
    placeholder: '07700 123456',
    dialCode: '+44'
  },
  {
    code: 'PT',
    name: 'Portugal',
    flag: '🇵🇹',
    placeholder: '912 345 678',
    dialCode: '+351'
  },
  {
    code: 'BR',
    name: 'Brasil',
    flag: '🇧🇷',
    placeholder: '(11) 91234-5678',
    dialCode: '+55'
  },
  {
    code: 'CA',
    name: 'Canadá',
    flag: '🇨🇦',
    placeholder: '(416) 123-4567',
    dialCode: '+1'
  },
  {
    code: 'JP',
    name: 'Japón',
    flag: '🇯🇵',
    placeholder: '090-1234-5678',
    dialCode: '+81'
  }
];

export default countryCodes;
