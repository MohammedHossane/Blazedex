import React, { useEffect, useState } from "react";
import { Container, Row, Col, Spinner } from "react-bootstrap";
import InfiniteScroll from "react-infinite-scroll-component";
import styled from "styled-components";
import Header from "../../components/Header/Header";
import PokeCard from "../../components/Pokemon/PokeCard";
import Search from "../../components/Others/Search";
import LoadingCard from "../../components/Loading/LoadingCard";
import api from "../../services/api";
import Colors from "../../styles/Colors";
import { SavePokemons, VerifyPokemons } from "../../functions/storage";

var pokemonsOriginal = [];
const perPage = 16;
const limit = 151; //default = 898
var max = 0;

function leadingZeros(n) {
  if (n > 0 && n < 10) {
    return `00${n}`;
  } else if (n > 9 && n < 100) {
    return `0${n}`;
  } else {
    return `${n}`;
  }
}
const Box = styled.div`
  background-color: white;
  display: flex;
  flex-direction: row;
  border-radius: 10px;
  color: white;
`;


function Home({ history, ...props }) {
  const { query } = props.match.params;
  const [allPokemons, setAllPokemons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pokemons, setPokemons] = useState([]);

  function HandlerResult(maximum, pokemons) {
    max = maximum;
    setPokemons(pokemons);
  }

  useEffect(() => {
    setLoading(true);
    if (query === undefined) {
      HandlerResult(
        pokemonsOriginal.length,
        pokemonsOriginal.slice(0, perPage)
      );
      setLoading(false);
      return false;
    }

    history.push(`/${query}`);
    var filterPokemons = pokemonsOriginal.filter((item) => {
      return (
        item.name.includes(query.toLowerCase()) || item.number.includes(query)
      );
    });

    HandlerResult(filterPokemons.length, filterPokemons.slice(0, perPage));
    setLoading(false);
  }, [history, query]);

  useEffect(() => {
    setLoading(true);
    var listLocal = VerifyPokemons();
    if (listLocal == null) {
      LoadPokemons();
      return false;
    }

    pokemonsOriginal = listLocal;
    if (query !== undefined) {
      var filterPokemons = listLocal.filter(
        (i) => i.name.includes(query.toLowerCase()) || i.number.includes(query)
      );

      HandlerResult(filterPokemons.length, filterPokemons.slice(0, perPage));
    } else {
      HandlerResult(listLocal.length, listLocal.slice(0, perPage));
    }
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function LoadPokemons() {
    let pokeList = await api.get(`/pokemon?limit=${limit}`);
    var all = [];
    for (var i = 0; i < pokeList.data.results.length; i++) {
      let pokeDetails = await api.get(
        `/pokemon/${pokeList.data.results[i].name}`
      );

      var obj = {
        name: pokeDetails.data.name,
        id: pokeDetails.data.id,
        types: pokeDetails.data.types,
        number: pokeDetails.data.id.toString().padStart(3, "0"),
        image:
          pokeDetails.data.sprites.versions["generation-vii"][
            "ultra sun and ultra moon"
          ].animated.front_default,
      };
      all.push(obj);
    }

    SavePokemons(all);
    pokemonsOriginal = all;
    HandlerResult(all.length, all);
    setLoading(false);
  }

  function LoadMore() {
    setTimeout(() => {
      var limit = pokemons.length + perPage;
      if (query === undefined) {
        setPokemons(pokemonsOriginal.slice(0, limit));
      } else {
        var filterPokemons = pokemonsOriginal.filter((item) => {
          return (
            item.name.includes(query.toLowerCase()) ||
            item.number.includes(query)
          );
        });
        setPokemons(filterPokemons.slice(0, limit));
      }
    }, 1000);
  }

  return (
    <div>
      <Header />

      <Container fluid>
        <button
          onClick={() => {
            setAllPokemons([
              ...allPokemons,
              leadingZeros(allPokemons.length + 1),
            ]);
            console.log(allPokemons);
          }}
        >
          PRESS ME
        </button>
        <Container>
        {allPokemons.map((allPokemons, i) => (
          <Box key={i}>
            {`#${allPokemons}`}
            <img src={`https://assets.pokemon.com/assets/cms2/img/pokedex/detail/${allPokemons}.png`} alt="Pokemon"></img>
          </Box>
        ))}
      </Container>
        <Search history={history} query={query} />
        {loading ? (
          <LoadingCard qty={12} />
        ) : (
          <InfiniteScroll
            style={{ overflow: "none" }}
            dataLength={pokemons.length}
            next={LoadMore}
            hasMore={pokemons.length < max}
            loader={
              <div className="mb-4 d-flex justify-content-center align-item-center">
                <Spinner
                  style={{ color: Colors.card_gray }}
                  animation="border"
                  role="status"
                >
                  <span className="sr-only">Loading...</span>
                </Spinner>
              </div>
            }
          >
            <Row>
              {pokemons.map((item) => {
                return (
                  <Col key={item.id} xs={12} sm={6} lg={3}>
                    <PokeCard
                      name={item.name}
                      id={item.id}
                      types={item.types}
                      click={true}
                    />
                  </Col>
                );
              })}
            </Row>
          </InfiniteScroll>
        )}
      </Container>
    </div>
  );
}

export default Home;
