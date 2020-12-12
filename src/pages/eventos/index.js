import React, { useState, useEffect } from 'react';
import {Container, Button, Table, Form, Card, FormFile} from 'react-bootstrap';
import FileUploader from 'react-firebase-file-uploader';

import { db, storage } from '../../utils/firebaseConfig'
 
const Eventos = () => {
    const [id, setId] = useState(0);
    const [nome, setNome] = useState('');
    const [descricao, setDescricao] = useState('');
    const [urlImagem, setUrlImagem] = useState('');

    const [eventos, setEventos] = useState([]);

    useEffect(() => {
        listarEventos()
    }, []);

    const listarEventos = () => {
        try{
            db.collection('eventos')
                .get()
                .then( result => {
                    // console.log(result.docs)
                    const data = result.docs.map(doc => {
                        return{
                            id : doc.id,
                            nome : doc.data().nome,
                            descricao : doc.data().descricao,
                            urlImagem : doc.data().urlImagem
                        }
                    })
                    setEventos(data);
                });
        } catch(error){
            console.log(error)
        }

    };

    const salvar = (event) => {
        event.preventDefault();

        const evento = {
            nome : nome,
            descricao : descricao,
            urlImagem : urlImagem
        }

        if (id === 0){
            db.collection('eventos')
                .add(evento)
                .then(() => {
                    alert('Evento salvo com sucesso!');
                })
                .catch(error => console.error(error))
        } else{
            db.collection('eventos')
                .doc(id)
                .set(evento)
                .then(() => {
                    alert('Evento alterado com sucesso!')
                    listarEventos();
                })
        };
        listarEventos();
        limparCampos();
    };

    const remover = (event) => {
        event.preventDefault();

        db.collection('eventos')
        .doc(event.target.value)
        .delete()
        .then(() => {
            alert('Evento removido com sucesso!')
            listarEventos();
        })
    };

    const editar = (event) => {
        event.preventDefault();

        try{
            db.collection('eventos')
                .doc(event.target.value)
                .get()
                .then(doc => {
                    setId(doc.id);
                    setNome(doc.data().nome);
                    setDescricao(doc.data().descricao);
                })
        }catch(error) {
            console.log(error)
        }
    };

    const limparCampos = () => {
        setId(0);
        setNome('');
        setDescricao('');
        setUrlImagem('')
    };

    const handleUploadError = error => {
        console.error(error);
    };

    const handleUploadSuccess = filename => {
        storage
            .ref('imagens')
            .child(filename)
            .getDownloadURL()
            .then(url => setUrlImagem(url))
            .catch(error => console.error(error))


    };
     

    return ( 
        <div>
            <Container>
                <Card>
                    <Card.Body>
                        <Form onSubmit={event => salvar(event)}>
                            <Form.Group>
                                {urlImagem && <img src={urlImagem} style={{width : '200px'}} /> }
                                <label style={{backgroundColor: 'steelblue', color: 'white', padding: 10, borderRadius: 4, cursor: 'pointer'}}>
                                    Selecione sua imagem
                                    <FileUploader 
                                        hidden
                                        accept="image/*"
                                        name="urlImagem"
                                        storageRef={storage.ref('imagens')}
                                        
                                        onUploadSuccess={handleUploadSuccess}
                                        onUploadError={handleUploadError}

                                    />
                                </label>
                            </Form.Group>
                            <Form.Group controlId="formBasicNome">
                                <Form.Label>Nome</Form.Label>
                                <Form.Control type="text" value={nome} onChange={event => setNome(event.target.value)} placeholder="Nome do evento"></Form.Control>
                            </Form.Group>
                            
                            <Form.Group controlId="formBasicUrl">
                                <Form.Label>Descrição</Form.Label>
                                <Form.Control as="textarea" rows={3} value={descricao} onChange={event => setDescricao(event.target.value)}/>
                            </Form.Group>

                            <Button type="submit">Salvar</Button>
                        </Form>
                    </Card.Body>
                </Card>

                <Table striped bordered hover>
                    <thead>
                        <tr>
                            <th>Imagem</th>
                            <th>Nome</th>
                            <th>Descrição</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                    {
                            eventos.map((item, index) => {
                                return (
                                    <tr key={index}>
                                        <td><img src={item.urlImagem} style={{width : '150px'}} /> </td>
                                        <td>{item.nome}</td>
                                        <td>{item.descricao}</td>
                                        <td>
                                            <Button variant="warning" value={item.id} onClick={event => editar(event)} >Editar</Button>
                                            <Button variant="danger" value={item.id} onClick={event => remover(event)} style={{ marginLeft : '40px'}}>Remover</Button>
                                        </td>
                                    </tr>
                                )
                            })
                        }
                    </tbody>
                </Table>
            </Container>
        </div>
    );
}
 
export default Eventos;