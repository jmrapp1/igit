import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import roger from '../jolly-roger';

import Loading from './Loading';
import PRLink from './PRLink';
import PR from './PR';

export default function Repo({ match }) {
  const [ repos ] = roger.useState('repos', []);
  const repo = repos.find(({ repoId }) => repoId === parseInt(match.params.id, 10));
  const { getPRs } = roger.useContext();
  const [ prs, setPRs ] = useState(null);
  const [ selectedPR, setSelectedPR ] = useState(null);
  const [ error, setError ] = useState(false);

  useEffect(() => {
    getPRs(repo).then(setPRs, error => {
      console.log(error);
      setError(error);
    });
  }, []);

  if (!repo) {
    return (
      <div className='view-repo'>
        <p className='tac mt2'>
          Ops! The repository can not be found. Please go back to the <Link to='/'>dashboard</Link>.
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className='view-repo'>
        <p className='tac mt2'>
          Ops! There is an error fetching the pull requests of { repo.fullName }. Wait a bit and refresh the page.
        </p>
      </div>
    );
  }

  if (prs === null) {
    return (
      <div className='view-repo'>
        <h2 className='tac mt2'>{ repo.fullName }</h2>
        <Loading showLogo={ false } message={ `Loading pull requests for ${ repo.fullName }.` }/>
      </div>
    );
  }

  if (prs.length === 0) {
    return (
      <div className='view-repo'>
        <h2 className='tac mb1 mt2'>
          <Link to='/'>/ repos</Link> / { repo.fullName.split('/')[1] } / pull requests
        </h2>
        <p className='tac mt2'>No pull requests in { repo.fullName } repository.</p>
      </div>
    );
  }

  return (
    <div className={ selectedPR ? 'view-repo open-pr' : 'view-repo' }>
      <h2 className='tac mb1 mt2'>
        <Link to='/'>/ repos</Link> / { repo.fullName.split('/')[1] } / pull requests
      </h2>
      <div className='repo-content'>
        <div className='prs'>
          {
            prs.map((pr, key) => (
              <PRLink pr={ pr } key={ key } toggleDetails={ setSelectedPR } selected={ selectedPR === pr }/>
            ))
          }
        </div>
        { selectedPR && <PR repo={ repo }pr={ selectedPR } /> }
      </div>
    </div>
  );
}

Repo.propTypes = {
  match: PropTypes.object.isRequired
};
