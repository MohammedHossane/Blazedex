import React from "react";
import { Container } from "react-bootstrap";

import "./styles.css";

const Header = () => {
  return (
    <header className="container-header mb-5">
      <Container fluid>
        <div className="text-center">
          {/* <Link to="/">
            <img title="Go to home" alt="Go to home" src={logo} />
          </Link> */}
          <h1 style={{color: '#d82d2d'}}> Blazédex </h1>
        </div>
      </Container>
    </header>
  );
};

export default Header;
