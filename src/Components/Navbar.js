import React from 'react';

const Navbar = ({ username, onSignOut }) => {
  return (
    <div className='navbar'>
      <h1>MY DROPBOX</h1>
      <div className='user-profile'>
        <h2 className='user-name'>{username}</h2>
        <button className='logout-btn' onClick={onSignOut}>Sign Out</button>
      </div>
    </div>
  );
};

export default Navbar;
