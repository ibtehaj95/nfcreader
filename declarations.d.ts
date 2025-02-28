type NFCTagDataType =  {
    id: number;
    machine_name: string;
    manual_url: string;
    service_record: string[];
};

type NFCTagsListType = NFCTagData[];