import React, { useState, useEffect } from 'react';
import { useComponentWillMount } from '../../utils';
import axios from 'axios';

export default (props) => {
    let [editing, setEditing] = useState(false);
    let [disabled, setDisabled] = useState(false);

    // custom hook
    useComponentWillMount(() => {
        let editingCells = props.api.getEditingCells();
        if (editingCells.length !== 0) {
            setDisabled(true);
        }
    })

    useEffect(() => {
        props.api.addEventListener('rowEditingStarted', onRowEditingStarted);
        props.api.addEventListener('rowEditingStopped', onRowEditingStopped);

        return () => {
            props.api.removeEventListener('rowEditingStarted', onRowEditingStarted);
            props.api.removeEventListener('rowEditingStopped', onRowEditingStopped);
        };
    }, []);

	 async function updateSong(songID, song) {
		try {
			await axios.put(`http://localhost:5000/api/music/${songID}`, song);
		} catch(error) {
			console.log("error", error);
		}
	}

	async function deleteSong(songID) {
		try {
			await axios.delete(`http://localhost:5000/api/music/${songID}`);
		} catch(error) {
			console.log("error", error);
		}
	}

    function onRowEditingStarted(params) {
        if (props.node === params.node) {
            setEditing(true);
        } else {
            setDisabled(true);
        }
    };

    function onRowEditingStopped(params) {
        if (props.node === params.node) {
            if (isEmptyRow(params.data)) {
                deleteRow(true);
            } else {
					updateSong(props.data.id, props.data);
					setEditing(false);
            }
        } else {
            setDisabled(false);
        }
    }

    function startEditing() {
        props.api.startEditingCell({
            rowIndex: props.rowIndex,
            colKey: props.column.colId,
        });
    }

    function stopEditing(bool) {
        props.api.stopEditing(bool);
		  if (props.api.stopEditing = true) {
		  }
    }

    function deleteRow(force = false) {
        let data = props.data;
        let confirm = true;
        if (!force) {
            confirm = window.confirm(`are you sure you want to delete this row: ${JSON.stringify(data)})`)
        }
        if (confirm) {
            props.api.updateRowData({ remove: [data] });
            props.api.refreshCells({ force: true });
				deleteSong(data.id);
        }
    };

    function isEmptyRow(data) {
        let dataCopy = { ...data };
        delete dataCopy.id;
        return !Object.values(dataCopy).some(value => value);
    }

    return (
        <div>
            {editing
                ? <>
                    <button
                        color="primary"
                        variant="contained"
                        onClick={() => stopEditing(false)}
                        disabled={disabled}>Update</button>
                    <button
                        color="secondary"
                        variant="contained"
                        onClick={() => stopEditing(true)}
                        disabled={disabled}>Cancel</button>
                </>
                : <>
                    <button
                        color="primary"
                        variant="outlined"
                        onClick={startEditing}
                        disabled={disabled}>Edit</button>
                    <button
                        color="secondary"
                        variant="outlined"
                        onClick={() => deleteRow()}
                        disabled={disabled}>Delete</button>
                </>
            }
        </div>
    )
}
