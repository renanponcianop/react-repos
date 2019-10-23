import React, {useState, useEffect} from 'react';
import { Container, Owner, Loading, BackButton, IssuesList, PageActions, Filter } from './styles';
import { FaArrowLeft } from 'react-icons/fa'
import api from '../../services/api';

export default function Repositorio({match}){

    const [repositorio, setRepositorio] = useState({});
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [filter, setFilter] = useState('open'); // aberta já é o default do github

    useEffect(()=>{

        async function load(){
            const nomeRepo = decodeURIComponent(match.params.repositorio);

            const [repositorioData, issuesData] = await Promise.all([
                api.get(`/repos/${nomeRepo}`),
                api.get(`/repos/${nomeRepo}/issues`, {
                    params: {
                        state: 'open',
                        per_page: 5
                    }
                })
            ]);
            setRepositorio(repositorioData.data);
            setIssues(issuesData.data);
            setLoading(false);

        };

        load();

    }, [match.params.repositorio]);

    useEffect(()=>{
        async function loadIssue(){
            const nomeRepo = decodeURIComponent(match.params.repositorio);

            const response = await api.get(`/repos/${nomeRepo}/issues`, {
                params:{
                    state: filter,
                    page,
                    per_page: 5,
                },
            });

            setIssues(response.data);

        }

        loadIssue();
    },[page, filter])

    function handlePage(action){
        setPage(action === 'back' ? page - 1 : page + 1);
    }

    function handleFilter(filterSelected){
        setFilter(filterSelected);
    }


    if(loading){
        return(
            <Loading>
                <h1>Carregando</h1>
            </Loading>
        );
    }

    return(
        <Container>
            <BackButton to="/">
                <FaArrowLeft color="#000" size={35} />
            </BackButton>
            <Owner>
                <img 
                    src={repositorio.owner.avatar_url} alt={repositorio.owner.login} 
                    alt={repositorio.owner.login}
                />
                <h1>{repositorio.name}</h1>
                <p>{repositorio.description}</p>
            </Owner>

            <IssuesList>
                <Filter>
                    <p>Issues do tipo:</p>
                    <button type="button" onClick={()=> handleFilter('open')} disabled={filter === 'open'}>Abertas</button>
                    <button type="button" onClick={()=> handleFilter('all')} disabled={filter === 'all'}>Todas</button>
                    <button type="button" onClick={()=> handleFilter('closed')} disabled={filter === 'closed'}>Encerradas</button>
                </Filter>
                {issues.map(issue => (
                    <li key={String(issue.id)}>
                        <img src={issue.user.avatar_url} alt={issue.user.login} />

                        <div>
                            <strong>
                                <a href={issue.html_url}>{issue.title}</a>

                                {
                                    issue.labels.map(label => (
                                        <span key={String(label.id)}>{label.name}</span>
                                    ))
                                }

                            </strong>
                            <p>{issue.user.login}</p>
                        </div>

                    </li>
                ))}
            </IssuesList>
            <PageActions>
                <button 
                    type="button" 
                    onClick={()=> handlePage('back')}
                    disabled={page < 2}
                >
                    Voltar
                    </button>
                <p>{page}</p>
                <button type="button" onClick={()=> handlePage('next')}>
                    Proxima
                </button>
            </PageActions>
        </Container>
    )
}