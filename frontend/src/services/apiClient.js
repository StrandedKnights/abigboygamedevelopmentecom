/**
 * Centralized API client for A Big Boy's Game.
 */

const API_BASE_URL = 'http://localhost:3000/api';

/**
 * Mock function to simulate fetching latest additions with latency.
 */
export async function getLatestAdditions() {
    // Simulate network latency
    await new Promise(resolve => setTimeout(resolve, 500));

    // Dummy data matching current hardcoded cards
    return [
        { 
            id: '1', 
            title: 'Super Mario World', 
            platform: 'Nintendo Switch', 
            priceInCents: 4999, 
            imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBTj3C5Yj894z0VKWQwybVwB-FTh6ir8hBnVji8eZQUdyQuUjlSG9zyjwvGW5QBEub-AXJerM5DLqXYIEK3aCPa9SHN0r_xo-Tsi_Pg_1sterUtsA2LHqZ8doGse04XatcmFDyoJIeNV4LuC1hm8dQnfUzNhh3Ce5i1xSjvSG-Y8kzuzcfMaraWU7B39f-aFWED1zXzMlsqjJE1UnDoiblaPHcLFadaIOHQEkpxx8n_EIS_FbjAJlXaMe1eIuWxfjYDuOYCv4d1RYU', 
            platformColor: '#ff4b4b' 
        },
        { 
            id: '2', 
            title: 'Final Fantasy VII', 
            platform: 'PlayStation 1', 
            priceInCents: 8500, 
            imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDPS9P2VK2V1sVznp-_2TsReaBA0iGnIt9gxWWS8gvq0ua-jIFrFsIo-sDyKyYTpxiPM7lLTmDFXpFygewSSpPuW_JOv-Z0ZWtimsuTNzsOqXQEkheSYQgfGv182RTSk0rrpEMSBUAdionmhF4HBPO7MdlGqXPJrohVOo3JSGMzGT0oOMbbpGJFmv8gNWG4iydS5CpU8LvdbODV1iNAXEtG4NS-CUXzbHx06WijkNH8Ftllth12xKEKU7ktx6nmQnqctWQ2C65jVmk', 
            platformColor: '#00439c' 
        },
        { 
            id: '3', 
            title: 'Halo: Combat Evolved', 
            platform: 'Xbox', 
            priceInCents: 2450, 
            imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD1YIMvcmOS4WueXsKoBILLQ0oAklOnTsAewl-W8rUe5Qg9wBaysqmanN35wRR-dn_077sdAxrzrVeyqBfDeA1e71RK0NzrSrfw1SA1iNk9CHfyMf2QNH39AB9bEsobEGvRZY-KK7Kr4PlQJSOcCgwGt_exBfSR5ApsvHsoRH9YGl-FKfDvEb_Dm4D1MuqGKvE6a8Y2GcS-o9zQbz29nwlRq5S7dah2rCeM-i3eoFIjJaBrbzB93GeIz7JFjrVPxV6KTsNwLqXFqqA', 
            platformColor: '#107c10' 
        },
        { 
            id: '4', 
            title: 'Sonic the Hedgehog 2', 
            platform: 'Sega Mega Drive', 
            priceInCents: 3995, 
            imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC_WR_CJULssLm-ShRvzp3KE9R74jAP7R4nTKLZCYU8rj4v_XimcJKPCA1Saom3Vmt2wknxFK34ZTTqHC207MGWbe1Fa85VOHV6sdlpgyOXbPFWF7fG9TSRkjjvdoHPd1UUK0p3FvUGtP5dmRzwool2guWjFQtbzborjVFwolJdYAE7etR-8PuS1AZep_etG8kkp0Q2Zj6v3BDMqSNLAbMf8nAGjTPAYbNSk90vfH2FNOIXe_ouosLbY19KP4hKmp2Z3S8V6Myy-Hs', 
            platformColor: '#0054a6' 
        },
        { 
            id: '5', 
            title: 'Pokémon Yellow', 
            platform: 'Game Boy', 
            priceInCents: 7400, 
            imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuABQ7o2wI46_3WBWi5SyvWvtnY73XAf5Yi2v1I-EukfUKSH3qWegENEVTmE5QyxfwX7-7Zfc27qpsSQ1SIFcuI6LzvkeeQ0XdIoBT0ic7liTWlSCNzYuJaKpznW2ILj3C0VG7evtwUzm8DWLc4bYD0_8_7_vOyDrnrzNexUAD86oK2hGu_kRf7RpjS8hHpo5tp25KBWFGev3Ou5wbDdKq6uFuKoYmm84c6B3aXHlqu7u5phugt6IGyrHWFfcw8fiXGjtpowhTDGQIw', 
            platformColor: '#6c2891' 
        },
        { 
            id: '6', 
            title: 'GoldenEye 007', 
            platform: 'Nintendo 64', 
            priceInCents: 5500, 
            imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA9f9e7cxJx_3k0IWes77auUoq2N2hEUbXfq8LKM8kWdwKaC9j9hg_OXm0vegfuUQRiNVw2jAczPnoO5jxG1JtIgS1dLAF162Wi4ZmrC3mOteiY_sUKUKBjxrurIDdweXgDZJSZPFWVvIqJaE8vw_TYrJoRxRSJtNw_OwIeqsy-7zZMlAf5Rp1ymJvZR4PS9COaMccp7l0u2XzHWnS-lNsJVWNSo_cjqmQN7E2Ev-dNOOFC7_IiCIuvFxMqrv3nuvehLaUEf-jfFlk', 
            platformColor: '#ff4b4b' 
        },
    ];
}
