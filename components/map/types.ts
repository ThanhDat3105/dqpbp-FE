export type PersonType = 'TUOI_17' | 'QUAN_NHAN_DU_BI' | 'DQCD' | 'HQ'

export interface Person {
    id: string
    name: string
    type: PersonType
    kp: string
    address: string
    yearJoined: number
    lat: number
    lng: number
    streetViewUrl?: string
}

export const PIN_CONFIG: Record<
    PersonType,
    { color: string; label: string; sublabel: string; textColor: string }
> = {
    TUOI_17: {
        color: '#E53E3E',
        label: 'Tuổi 17',
        sublabel: 'Thanh niên tuổi 17',
        textColor: '#fff',
    },
    QUAN_NHAN_DU_BI: {
        color: '#3182CE',
        label: 'Quân nhân dự bị',
        sublabel: 'Quân nhân dự bị',
        textColor: '#fff',
    },
    DQCD: {
        color: '#38A169',
        label: 'DQCĐ',
        sublabel: 'Dân quân cơ động',
        textColor: '#fff',
    },
    HQ: {
        color: '#D69E2E',
        label: 'Trụ sở UBND',
        sublabel: 'Trụ sở',
        textColor: '#fff',
    },
}
