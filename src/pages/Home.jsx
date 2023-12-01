/* eslint-disable react/prop-types */
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import axios from 'axios';
import { Header } from '../components/Header';
import { url } from '../const';
import { differenceInMinutes, format } from 'date-fns';
import ja from 'date-fns/locale/ja';
import './home.scss';

export const Home = () => {
  const [isDoneDisplay, setIsDoneDisplay] = useState('todo'); // todo->未完了 done->完了
  const [lists, setLists] = useState([]);
  const [selectListId, setSelectListId] = useState();
  const [focusedTabIndex, setFocusedTabIndex] = useState();
  const [tasks, setTasks] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [cookies] = useCookies();
  const handleIsDoneDisplayChange = (e) => setIsDoneDisplay(e.target.value);
  useEffect(() => {
    axios
      .get(`${url}/lists`, {
        headers: {
          authorization: `Bearer ${cookies.token}`,
        },
      })
      .then((res) => {
        setLists(res.data);
      })
      .catch((err) => {
        setErrorMessage(`リストの取得に失敗しました。${err}`);
      });
  }, []);

  useEffect(() => {
    const listId = lists[0]?.id;
    if (typeof listId !== 'undefined') {
      setSelectListId(listId);
      axios
        .get(`${url}/lists/${listId}/tasks`, {
          headers: {
            authorization: `Bearer ${cookies.token}`,
          },
        })
        .then((res) => {
          setTasks(res.data.tasks);
        })
        .catch((err) => {
          setErrorMessage(`タスクの取得に失敗しました。${err}`);
        });
    }
  }, [lists]);

  const handleSelectList = (id) => {
    setSelectListId(id);
    axios
      .get(`${url}/lists/${id}/tasks`, {
        headers: {
          authorization: `Bearer ${cookies.token}`,
        },
      })
      .then((res) => {
        setTasks(res.data.tasks);
      })
      .catch((err) => {
        setErrorMessage(`タスクの取得に失敗しました。${err}`);
      });
  };

  const tabs = document.querySelectorAll('[role="tab"]');

  const tabsLength = lists.length;

  const handleFocus = (e) => {
    const currentFocusedTabIndex = e.currentTarget.getAttribute('aria-posinset');
    setFocusedTabIndex(currentFocusedTabIndex);
  };

  const handleKeyDown = (e) => {
    const key = e.key;
    switch (key) {
      case "ArrowRight":
        focusNextTab();
        break;
      case "ArrowLeft":
        focusPreviousTab();
        break;
    };
  };

  const tabsLastIndex = tabsLength - 1;

  const focusTab = (index) => {
    tabs[index].focus();
  };

  const focusNextTab = () => {
    const currentIndex = Number(focusedTabIndex - 1);
    let nextIndex = currentIndex + 1;
    if (nextIndex > tabsLastIndex) {
      nextIndex = 0;
    }
    focusTab(nextIndex);
  };

  const focusPreviousTab = () => {
    const currentIndex = Number(focusedTabIndex - 1);
    let nextIndex = currentIndex - 1;
    if (nextIndex < 0) {
      nextIndex = tabsLastIndex;
    }
    focusTab(nextIndex);
  };

  return (
    <div>
      <Header />
      <main className="taskList">
        <p className="error-message">{errorMessage}</p>
        <div>
          <div className="list-header">
            <h2>リスト一覧</h2>
            <div className="list-menu">
              <p>
                <Link to="/list/new">リスト新規作成</Link>
              </p>
              <p>
                <Link to={`/lists/${selectListId}/edit`}>選択中のリストを編集</Link>
              </p>
            </div>
          </div>
          <ul className="list-tab" role="tablist">
            {lists.map((list, key) => {
              const isActive = list.id === selectListId;
              return (
                <li role='presentation' className="list-tab-item" key={key}>
                  <button
                    type="button"
                    className={isActive ? 'active' : ''}
                    onClick={() => handleSelectList(list.id)}
                    onFocus={handleFocus}
                    onKeyDown={handleKeyDown}
                    role="tab"
                    aria-selected={isActive ? 'true' : 'false'}
                    aria-setsize={lists.length}
                    aria-posinset={key + 1}
                    tabIndex={isActive ? '0' : '-1'}
                  >
                    {list.title}
                  </button>
                </li>
              );
            })}
          </ul>
          <div className="tasks">
            <div className="tasks-header">
              <h2>タスク一覧</h2>
              <Link to="/task/new">タスク新規作成</Link>
            </div>
            <div className="display-select-wrapper">
              <select onChange={handleIsDoneDisplayChange} className="display-select">
                <option value="todo">未完了</option>
                <option value="done">完了</option>
              </select>
            </div>
            {lists.map((list, key) => {
              const isActive = list.id === selectListId;
              return (
                <div
                  key={key}
                  role="tabpanel"
                  hidden={!isActive}
                >
                  <Tasks tasks={tasks} selectListId={selectListId} isDoneDisplay={isDoneDisplay} />
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
};

// 表示するタスク
const Tasks = (props) => {
  const { tasks, selectListId, isDoneDisplay } = props;

  const formatLimit = (limit) => format(new Date(limit), 'yyyy年MM月dd日 HH:mm', { locale: ja });

  const differenceLimit = (limit) => differenceInMinutes(new Date(limit), new Date());

  const minToDayTime = (minutes) => {
    const minutesInADay = 60 * 24;
    const days = Math.floor(minutes / minutesInADay);
    const remainingMinutes = minutes % minutesInADay;
    const hours = Math.floor(remainingMinutes / 60);
    const finalMinutes = remainingMinutes % 60;

    let result = '';
    if (days > 0) result += `${days}日`;
    if (hours > 0) result += `${hours}時間`;
    if (finalMinutes > 0) result += `${finalMinutes}分`;

    return result;
  };

  if (tasks === null) return <></>;

  if (isDoneDisplay === 'done') {
    return (
      <ul>
        {tasks
          .filter((task) => {
            return task.done === true;
          })
          .map((task, key) => (
            <li key={key} className="task-item">
              <Link to={`/lists/${selectListId}/tasks/${task.id}`} className="task-item-link">
                {task.title}
                <br />
                {task.done ? '完了' : '未完了'}
                <br />
                期限：{task.limit ? formatLimit(task.limit) : 'なし'}
              </Link>
            </li>
          ))}
      </ul>
    );
  }

  return (
    <ul>
      {tasks
        .filter((task) => {
          return task.done === false;
        })
        .map((task, key) => (
          <li key={key} className="task-item">
            <Link to={`/lists/${selectListId}/tasks/${task.id}`} className="task-item-link">
              {task.title}
              <br />
              {task.done ? '完了' : '未完了'}
              <br />
              期限：{task.limit ? formatLimit(task.limit) : 'なし'}
              {task.limit ? differenceLimit(task.limit) > 0 ? `（残り${minToDayTime(differenceLimit(task.limit))}）` : '（超過！）' : ''}
            </Link>
          </li>
        ))}
    </ul>
  );
};
