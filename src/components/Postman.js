import React, { useState } from 'react';
import PropTypes from 'prop-types';

import roger from '../jolly-roger';
import { LoadingAnimation } from './Loading';

export default function Postman({ repo, pr, context, value, className, onSave }) {
  const [ profile ] = roger.useState('profile');
  const [ text, type ] = useState(value ? value.text : null);
  const [ submitted, submit ] = useState(false);
  const {
    addComment,
    editComment
  } = roger.useContext();
  const isEditing = !!value;

  // console.log(pr);

  const comment = async function () {
    if (typeof text === 'string' && text.length > 0) {
      submit(true);
      switch (context) {
        case 'IssueComment':
          if (isEditing) {
            await editComment({ repo, pr, id: value.id, body: text });
            submit(false);
            onSave(text);
          } else {
            await addComment({ repo, pr, body: text });
            type(null);
            submit(false);
            onSave(text);
          }
          break;
        default:
          console.error(`Postman does not support ${ context } context yet.`);
      }
    }
  };

  return (
    <div className={ `postman cf ${ className }` }>
      <div className='media small'>
        <img src={ profile.avatar } className='avatar' title={ profile.login }/>
        <textarea
          value={ text ? text : '' }
          placeholder='Reply'
          className={ text !== null ? 'type' : '' }
          onClick={ () => type(text || '') }
          disabled={ submitted }
          onChange={ e => type(e.target.value) } />
      </div>
      { (text !== null && !submitted) && <div className='right mt05'>
        <button className='brand cancel' onClick={ () => type(null) }>Cancel</button>
        <button className='brand cta' onClick={ comment }>Comment</button>
      </div> }
      { submitted && <div className='right mt05'><LoadingAnimation /></div> }
    </div>
  );
}

Postman.propTypes = {
  context: PropTypes.string.isRequired,
  repo: PropTypes.object.isRequired,
  pr: PropTypes.object.isRequired,
  value: PropTypes.object,
  className: PropTypes.string,
  onSave: PropTypes.func
};
Postman.defaultProps = {
  className: '',
  onSave: () => {}
};