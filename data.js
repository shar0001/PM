/* =============================================================
   Production OS — Mock Data
   ============================================================= */
const APP_DATA = {
    project: {
        id: "PRJ-2024-091",
        title: "Neon Drift — CM 30s",
        client: "APEX Motors",
        agency: "TBWA\\HAKUHODO",
        director: "Kiyoshi Nakamura",
        shootDate: "2024年10月24日 (木)",
        shootDay: "DAY 2 / 3",
        currentTime: "15:15",
        sunsetTime: "17:30",
        sunsetIn: 135, // minutes
        progressPct: 65,
        progressLabel: "巻ける見込みあり",
    },

    shots: [
        {
            id: "C42", number: 42, scene: 12,
            title: "屋上での出会い",
            type: "Wide Shot",
            status: "completed",
            scheduledTime: "14:00",
            duration: 45,
            lens: "18mm",
            cast: ["佐藤", "田中"],
            props: ["ベンチ"],
            location: "A棟 屋上",
            notes: "",
            completedAt: "14:52"
        },
        {
            id: "C43", number: 43, scene: 12,
            title: "夕日を背にした告白",
            type: "Close-up",
            status: "shooting",
            scheduledTime: "15:00",
            duration: 60,
            lens: "85mm / T1.4",
            cast: ["佐藤", "田中"],
            props: ["懐中電灯"],
            location: "A棟 屋上",
            notes: "MAKI +10m",
            delay: "+10m",
        },
        {
            id: "C44", number: 44, scene: 12,
            title: "走り去る田中",
            type: "Follow Shot",
            status: "upcoming",
            scheduledTime: "16:30",
            duration: 30,
            lens: "35mm",
            cast: ["田中"],
            props: [],
            location: "屋上 階段前",
            notes: ""
        },
        {
            id: "C45", number: 45, scene: 13,
            title: "廃倉庫 — 寄り (Close-up)",
            type: "Close-up",
            status: "upcoming",
            scheduledTime: "17:00",
            duration: 40,
            lens: "35mm / T2.0",
            cast: ["佐藤", "鈴木"],
            props: ["懐中電灯", "古い地図"],
            location: "廃倉庫 B棟",
            notes: ""
        },
        {
            id: "C46", number: 46, scene: 13,
            title: "廃倉庫 — 引き (Wide Shot)",
            type: "Wide Shot",
            status: "upcoming",
            scheduledTime: "17:45",
            duration: 35,
            lens: "18mm",
            cast: ["佐藤"],
            props: ["スモークマシン"],
            location: "廃倉庫 B棟",
            notes: ""
        },
        {
            id: "C41", number: 41, scene: 11,
            title: "手元のアップ (Insert)",
            type: "Insert",
            status: "completed",
            scheduledTime: "13:30",
            duration: 20,
            lens: "100mm macro",
            cast: ["鈴木"],
            props: ["古い手紙"],
            location: "A棟 室内",
            notes: "",
            completedAt: "13:58"
        },
        {
            id: "C47", number: 47, scene: 13,
            title: "切り返し (Over the Shoulder)",
            type: "OTS",
            status: "upcoming",
            scheduledTime: "18:30",
            duration: 30,
            lens: "50mm / T2.8",
            cast: ["鈴木"],
            props: [],
            location: "廃倉庫 B棟",
            notes: ""
        },
        {
            id: "C48", number: 48, scene: 14,
            title: "回想シーン – ロングショット",
            type: "Long Shot",
            status: "upcoming",
            scheduledTime: "19:00",
            duration: 50,
            lens: "24mm",
            cast: ["佐藤", "田中", "鈴木"],
            props: ["スモークマシン", "古い地図"],
            location: "廃倉庫前 広場",
            notes: ""
        },
    ],

    equipment: {
        camera: [
            {
                id: "CAM-A-01", name: "ARRI Alexa Mini LF", serial: "8392",
                location: "A-Cam Cart (Set)", status: "in-use",
                battery: 45, media: 85, mediaLabel: "1TB"
            },
            {
                id: "LENS-A-35", name: "Signature Prime 35mm", serial: "SP35-0021",
                location: "Lens Case 1 (Base)", status: "standby",
                battery: null, media: null
            },
            {
                id: "LENS-A-85", name: "Signature Prime 85mm", serial: "SP85-0017",
                location: "A-Cam Cart", status: "in-use",
                battery: null, media: null
            },
        ],
        lighting: [
            {
                id: "LGT-01", name: "ARRI SkyPanel S60-C", serial: "SP-1134",
                location: "Key Light Position", status: "in-use",
                battery: null, media: null
            },
            {
                id: "LGT-02", name: "Kino Flo Diva 400", serial: "KF-8821",
                location: "Base Camp", status: "standby",
                battery: null, media: null
            },
        ],
        grip: [
            {
                id: "GRP-01", name: "Dana Dolly Complete Kit", serial: "DD-0054",
                location: "Grip Truck", status: "standby",
                battery: null, media: null
            },
            {
                id: "GRP-02", name: "DJI Ronin 4D", serial: "R4D-2291",
                location: "A-Cam Cart", status: "in-use",
                battery: 72, media: null
            },
        ],
        audio: [
            {
                id: "AUD-01", name: "Sound Devices 833", serial: "SD-4492",
                location: "Sound Cart", status: "in-use",
                battery: 88, media: 30, mediaLabel: "256GB"
            },
            {
                id: "AUD-02", name: "Sennheiser MKH 416", serial: "MKH-7723",
                location: "Sound Cart", status: "in-use",
                battery: null, media: null
            },
        ],
    },

    budget: {
        total: 5000000,
        spent: 3750000,
        categories: [
            {
                id: "cast", label: "キャスト", icon: "groups",
                budget: 1200000, spent: 800000,
                items: [
                    { label: "Lead Actor (Day 1-3)", note: "Paid to Agency", amount: 450000 },
                    { label: "Supporting Cast", note: "3 Actors × 2 Days", amount: 250000 },
                    { label: "Extras (Crowd Scene)", note: "20 People + Coordinator", amount: 100000 },
                ]
            },
            {
                id: "equipment", label: "機材", icon: "videocam",
                budget: 1500000, spent: 1450000, risk: true,
                items: [
                    { label: "Camera Package (ARRI)", note: "Rental House A", amount: 850000 },
                    { label: "Lighting Truck", note: "Includes generator", amount: 400000 },
                    { label: "Unexpected Lens Replacement", note: "Damaged on set", amount: 200000, warning: true },
                ]
            },
            {
                id: "location", label: "ロケ地", icon: "location_on",
                budget: 800000, spent: 400000,
                items: [
                    { label: "A棟 屋上 使用料", note: "3日間", amount: 200000 },
                    { label: "廃倉庫 B棟 使用料", note: "2日間", amount: 150000 },
                    { label: "渋谷 撮影許可申請", note: "区役所", amount: 50000 },
                ]
            },
            {
                id: "art", label: "美術・小道具", icon: "palette",
                budget: 1500000, spent: 1100000,
                items: [
                    { label: "美術セット費", note: "廃倉庫ドレス", amount: 600000 },
                    { label: "衣装費", note: "全キャスト3日分", amount: 350000 },
                    { label: "小道具費", note: "各種", amount: 150000 },
                ]
            },
        ]
    },

    locations: [
        {
            id: "loc-1", name: "A棟 屋上 (Main Set)",
            status: "current",
            address: "渋谷区道玄坂2-2-1 A棟 屋上",
            parking: "B1F 演者・スタッフ用 (20台)",
            power: "100V / 30A × 4回線",
            loadIn: "北側搬入口より。14:00以降はハードケースのみ可。フレイトエレベーターC使用。",
            rainAlt: "A棟 5F 多目的スペース",
            coords: { lat: 35.6580, lng: 139.7016 },
            mapImg: null,
        },
        {
            id: "loc-2", name: "廃倉庫 B棟",
            status: "upcoming",
            address: "品川区東品川3-12-14 B棟",
            parking: "前面道路 演者用 (5台) / 機材車は東側荷捌き場",
            power: "発電機持込（確認済み）",
            loadIn: "東側搬入口。天井高3.5m。スライドドア対応。",
            rainAlt: "変更不要（室内）",
            coords: { lat: 35.6210, lng: 139.7430 },
            mapImg: null,
        },
        {
            id: "loc-3", name: "ベースキャンプ",
            status: "basecamp",
            address: "渋谷区代々木神園町2-1 代々木公園イベント広場",
            parking: "大型車対応 (10台)",
            power: "2000W 発電機 × 2基",
            loadIn: "正面ゲートより搬入可",
            rainAlt: "−",
            coords: { lat: 35.6710, lng: 139.6954 },
            mapImg: null,
        },
    ],

    weather: {
        current: { time: "NOW", icon: "cloud", temp: 22, rain: 10 },
        hourly: [
            { time: "15:00", icon: "cloud", temp: 21, rain: 15 },
            { time: "16:00", icon: "rainy", temp: 19, rain: 70, warn: true },
            { time: "17:00", icon: "partly_cloudy_day", temp: 18, rain: 30 },
            { time: "18:00", icon: "clear_night", temp: 16, rain: 5 },
        ]
    },

    crew: [
        { name: "中村 清志", role: "Director", callTime: "07:00", dept: "Direction" },
        { name: "田中 美咲", role: "1st AD", callTime: "06:30", dept: "Direction" },
        { name: "鈴木 亮", role: "DOP", callTime: "07:30", dept: "Camera" },
        { name: "山田 健太", role: "1st AC", callTime: "07:30", dept: "Camera" },
        { name: "佐藤 花", role: "Cast — LEAD", callTime: "09:00", dept: "Cast" },
        { name: "田中 翔", role: "Cast — SUPPORT", callTime: "10:00", dept: "Cast" },
        { name: "高橋 誠", role: "Gaffer", callTime: "07:00", dept: "Electric" },
        { name: "伊藤 奈々", role: "Sound Mixer", callTime: "07:30", dept: "Audio" },
        { name: "渡辺 大輔", role: "Art Director", callTime: "06:00", dept: "Art" },
        { name: "松本 リナ", role: "Hair & Makeup", callTime: "07:00", dept: "HMU" },
    ],

    simulator: {
        originalEnd: "17:30",
        currentDelay: 35, // minutes
        scenes: [
            { label: "SCENE 14", flex: 3, status: "active" },
            { label: "SCENE 15", flex: 2, status: "next" },
            { label: "BREAK", flex: 2, status: "break" },
            { label: "WRAP", flex: 2, status: "wrap" },
        ]
    }
};
