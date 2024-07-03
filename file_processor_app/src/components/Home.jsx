import React, {useEffect, useState} from 'react';
import {
    Button,
    Modal,
    Card,
    Image,
    CardContent,
    CardHeader,
    CardMeta,
    ModalActions,
    ModalContent,
    ModalHeader,
    ModalDescription,
    Header, Icon, Loader, Select
} from 'semantic-ui-react';
import styled from 'styled-components';
import {FileSenderAdapter} from "./sender.js";
import {ToastContainer} from "react-toastify";
import {FileList} from "./loader.js";
import * as PropTypes from "prop-types";

const DinaCard = ({ img, setImages, setData, page, rate }) => {
    const [load, setLoad] = useState(false);
    const [valid, setValid] = useState(true);

    const fileSender = new FileSenderAdapter();

    // useEffect(() => {
    //     const checkImageExists = async (url) => {
    //         try {
    //             const response = await fetch(url, { method: 'HEAD' });
    //             if (!response.ok) {
    //                 setValid(false);
    //             }
    //         } catch {
    //             setValid(false);
    //         }
    //     };
    //
    //     checkImageExists(img.url);
    // }, [load]);
    //
    // if (!valid) {
    //     setData((prev) => ({
    //         page: (prev.page - 1) >= 1? (prev.page - 1) : 1,
    //         rate: prev.rate,
    //     }));
    //     return null;
    // }

    return (
        <StyledCard>
            <CardContent>
                {load ? <Loader inline active /> : <Image src={img.url} size="small" />}
            </CardContent>
            <Button
                color={"green"}
                icon
                onClick={async () => {
                    setLoad(true);
                    setTimeout(() => {
                        setLoad(false);
                    }, Math.floor(Math.random() * 450));
                }}
            >
                <Icon name={"refresh"} />
                Recarregar
            </Button>
            <Button
                color={"red"}
                icon
                onClick={async () => {
                    setLoad(true);
                    await fileSender.delete(img.key);
                    setLoad(false);
                    setImages((prev) => prev.filter((f) => f.key !== img.key));
                    setData((prev) => ({
                        page: prev.page - 1,
                        rate: prev.rate,
                    }));
                }}
            >
                <Icon name={"trash"} />
                Remover
            </Button>
        </StyledCard>
    );
};


DinaCard.propTypes = {
    img: PropTypes.any,
    onClick: PropTypes.func
};
const Home = () => {
    const [images, setImages] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [data, setData] = useState({page: 1, rate: 1});
    const [op, setOp] = useState("hearts");
    const fileSender = new FileSenderAdapter();
    const fileLister = new FileList();

    const handleFileChange = (event) => {
        setSelectedFile(event.target.files[0]);
    };

    const handleAddImage = async () => {
        if (selectedFile) {
            const fileData = await selectedFile.arrayBuffer();
            const url = await fileSender.put(selectedFile.name, new Uint8Array(fileData), op);
            if (url) {
                setImages([...images, url]);
            }
        }
        setSelectedFile(null);
        setModalOpen(false);
    };

    const handleClean = async () => {
        setImages([]);
        setData(() => {
            return {
                page: 1,
                rate: 1,
            }
        })
    };

    const handleLoadMore = async () => {
        const {page, rate} = data;
        const resp = await fileLister.list(page, rate);
        console.log(page)

        const imagesLink = [];
        for (const entry of resp) {
            imagesLink.push({url: `http://file_sender:8082/resource?fileKey=${entry.url}`, key: entry.url});
        }

        setImages([...images, ...imagesLink]);
        if (imagesLink.length > 0) {
            setData(() => {
                return {
                    page: page + 1,
                    rate: rate,
                }
            })
        }
    };

    return (
        <Wrapper>
            <Container>
                <>
                    <ToastContainer
                        position="top-right"
                        autoClose={8000}
                        hideProgressBar={false}
                        closeOnClick
                        pauseOnHover
                        draggable
                        newestOnTop
                    />
                    <ButtonContainer>
                        <StyledButton color={"green"} labelPosition={"left"} icon onClick={() => setModalOpen(true)}>
                            <Icon name={"plus"}/>
                            Adicionar
                        </StyledButton>
                    </ButtonContainer>
                    <ImageGrid>
                        {images.map((img, index) => (
                            <DinaCard key={index} img={img} setImages={setImages} setData={setData}/>
                        ))}
                    </ImageGrid>
                    <ButtonContainer>
                        <StyledButton color={"blue"} labelPosition={"left"} icon onClick={handleLoadMore}>
                            <Icon name={"refresh"}/>
                            Carregar
                        </StyledButton>
                        <StyledButton color={"red"} labelPosition={"left"} icon onClick={handleClean}>
                            <Icon name={"dont"}/>
                            Limpar
                        </StyledButton>
                    </ButtonContainer>
                    <Modal centered={true} dimmer='blurring' onClose={() => setModalOpen(false)}
                           onOpen={() => setModalOpen(true)} open={modalOpen}>
                        <ModalHeader>Select a Photo</ModalHeader>
                        <ModalContent>
                            <input type="file" accept="image/*" onChange={handleFileChange}/>
                            <ModalDescription>
                                <Header>Upload an Image</Header>
                                <p>Select an image to upload.</p>
                            </ModalDescription>
                        </ModalContent>
                        <ModalActions>
                            <Select
                            onChange={(event, data)=>{
                                setOp(data.value)
                            }}
                                options={[
                                {key: "hearts", text: "Coração", value: "hearts"},
                                {key: "spades", text: "Espadas", value: "spades"},
                                {key: "clubs", text: "Paus", value: "clubs"},
                                {key: "diamonds", text: "Diamantes", value: "diamonds"},
                            ]}></Select>
                            <Button color='black' onClick={() => setModalOpen(false)}>
                                Cancel
                            </Button>
                            <Button
                                content="Upload"
                                labelPosition='right'
                                icon='checkmark'
                                onClick={handleAddImage}
                                positive
                            />
                        </ModalActions>
                    </Modal>
                </>
            </Container>
        </Wrapper>
    );
};

export const Container = styled.section`
    display: flex;
    width: 100vw;
    min-height: calc(100vh);
    max-height: calc(100vh);
    overflow: auto;
    @media (max-width: 768px) {
        overflow: auto;
    }
    background: white;
    padding: 30px;
    flex-direction: column;
`;

export const Wrapper = styled.section`
    display: flex;
    width: 100vw;
    min-height: 100vh;
    max-height: 100vh;
    overflow: hidden;
`;

const ButtonContainer = styled.div`
    display: flex;
    justify-content: center;
    margin-bottom: 20px;
    margin-top: 20px;
`;

const StyledButton = styled(Button)`
    && {
        margin: 0 10px;
    }
`;

const ImageGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 10px;
`;

const StyledCard = styled(Card)`
    && {
        margin: 0;
        width: 100%;
    }
`;

export default Home;
