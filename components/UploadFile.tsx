import React, {useEffect} from 'react'
import { Box, Button, Text } from '@chakra-ui/react';
import { useBundler } from '@/state/bundlr.context';
import { useRef, useState } from 'react';


// Upload files to the Arweave network and fetch files from Arweave network and list them.
const UploadFile = () => {
    const { balance, uploadFile, files } = useBundler();
    const [URI, setURI] = useState('')
    const [file, setFile] = useState<Buffer>()
    const hiddenFileInput = useRef(null);
    const [items, setItems] = useState<string[]>([]);

    useEffect(() => {
        files.length? setItems(files): '';
    });

    function onFileChange(e: any) {
        const file = e.target.files[0]
        if (file) {
            let reader = new FileReader()
            reader.onload = function () {
                if (reader.result) {
                    setFile(Buffer.from(reader.result as any))
                }
            }
            reader.readAsArrayBuffer(file)
        }
    }
    const handleClick = event => {
        hiddenFileInput.current.click();
    };

    const handleUpload = async () => {
        const res = await uploadFile(file);
        console.log('res.data', res.data);
        setURI(`http://arweave.net/${res.data.id}`)
        setItems((pv) => [res.data.id, ...pv]);
    }

    return (
        <>
            {
                balance && (
                    <div className='flex flex-col mt-20 justify-center items-center w-full'>

                        <>
                            <Button onClick={handleClick} className='mb-4'>
                                {file ? 'Change Selection' : 'Select JSON'}
                            </Button>
                            <input
                                accept="application/json"
                                type="file"
                                ref={hiddenFileInput}
                                onChange={onFileChange}
                                style={{ display: 'none' }}
                            />
                        </>

                        {
                            file && <button className='bg-gray-200 rounded px-8 py-2 text-black hover:bg-gray-100' onClick={handleUpload}>Upload File</button>
                        }
                        <div className='flex flex-col mt-10 justify-center items-center w-full'>
                            <Text fontSize={'2xl'}>
                                JSON file list uploaded
                            </Text>
                            {items.map((item,index) => (
                                <a key={item} href={`https://arweave.net/${item}`} className="card mt-5 hover:bg-red-100" target="_blank" rel="noopener noreferrer">
                                    <p>{index + 1})  {`https://arweave.net/${item}`}</p>
                                </a>
                            ))}
                        </div>
                    </div>
                )
            }</>
    )
}

export default UploadFile