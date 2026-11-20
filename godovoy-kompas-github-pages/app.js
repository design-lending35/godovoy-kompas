const beforeStarting = [
  'Этот документ — твой Годовой Компас. Он поможет осознанно закрыть прошлый год, извлечь уроки и спроектировать следующий год так, чтобы он был твоим.',
  '',
  'Работай с ним в тишине, без спешки.',
  'Можно пройти его за один раз, можно — за несколько подходов.',
  'Подготовь пространство. Убери лишнее.',
  'Возьми чай или кофе. Отключи уведомления.',
  'Сядь удобно. Закрой глаза. Сделай 5 глубоких вдохов и выдохов.',
  'Отпусти ожидания. Начинай, когда почувствуешь готовность.'
].join('\n');
const calendarGuide = 'Просмотри прошлый год неделя за неделей. Отметь важные события, значимые встречи, проекты и поворотные моменты. Запиши всё, что вспоминается.';

const life = ['Личная жизнь, семья','Карьера, обучение','Друзья, сообщество','Отдых, хобби, творчество','Физическое здоровье, спорт','Психология, самопознание','Привычки'];
const chapters = [
  ['Перед началом',beforeStarting,['Перелистай свой календарь']],
  ['О чём был мой год','Посмотри на сферы жизни и напиши, что важного происходило в каждой.',life],
  ['Отпускание','',['Три вещи, которые я готов(а) отпустить, чтобы двигаться дальше','Три вещи, которым я готов(а) сказать «нет»'],3],
  ['Шесть важных моментов года','Ответь честно, без идеализации.',['Самое мудрое решение, которое я принял(а)','Самый большой урок','Самый крупный риск','Самый большой сюрприз','Самая важная вещь, которую я сделал(а) для других','Самое большое дело, которое я завершил(а)']],
  ['Шесть вопросов о годе','Ответь письменно, можно коротко.',['Чем я горжусь больше всего?','Какие три человека повлияли на меня сильнее всего?','На каких трёх людей больше всего повлиял(а) я?','Что у меня не получилось завершить?','Что лучшего я открыл(а) в себе?','За что я больше всего благодарен(а)?']],
  ['Лучшие моменты','Опиши свои самые тёплые воспоминания. Где ты был(а)? С кем? Что чувствовал(а)? Какие запахи, звуки, вкусы запомнились?',['Мои самые тёплые воспоминания']],
  ['Итог года','',[['Прошедший год в трёх словах',3],['Три моих главных достижения',3],'Книга или фильм моего года','Почему именно так?']],
  ['Прощание и прощение','Даже если не до конца готов(а) — просто напиши.',['Кому или чему я хочу сказать «прощай»?','Что я готов(а) простить — другим или себе?']],
  ['Шесть пожеланий себе','',['В этом году я не буду откладывать в долгий ящик'],6],
  ['Источники энергии','',['В этом году я буду черпать энергию из…','Я буду самым(ой) храбрым(ой), когда…','Я скажу «да», когда…','В этом году я советую себе…','Этот год будет для меня особенным, потому что…']],
  ['Волшебные тройки 2027','Заполняй интуитивно.',['Три вещи, которыми я создам уют вокруг себя','Три вещи, которые я буду делать каждое утро','Три способа регулярно баловать себя','Три места, где я побываю'],3],
  ['Волшебные тройки 2027 · продолжение','Заполняй интуитивно.',['Три способа поддерживать отношения с близкими','Три подарка, которыми я отблагодарю себя','Три вещи, которые я буду любить в себе','Три вещи, которые я решусь попробовать'],3],
  ['Цели по сферам жизни','Определи 1–3 ключевые цели в каждой сфере.',life],
  ['Мой вклад','',['Что я сделаю в 2027 году, чтобы мир стал хоть немного лучше?','Опиши свой идеальный 2027 год. Как ты живёшь? Как ты себя чувствуешь? Какие люди рядом? Что делает этот год по-настоящему твоим?']]
];
const parts = [
  { year:2026, title:'Год минувший', start:0, end:8, icon:'✦' },
  { year:2027, title:'Год перед тобой', start:8, end:14, icon:'✧' }
];
const key = 'godovoy-kompas:2026-2027:v1';
const $ = (selector) => document.querySelector(selector);
let state = {answers:{},answerDates:{},done:[],current:0};
let storageAvailable = true;
try {
  const saved = JSON.parse(localStorage.getItem(key));
  if (saved && Array.isArray(saved.done) && saved.answers && Number.isInteger(saved.current)) state = saved;
} catch {
  storageAvailable = false;
}
state.answerDates ??= {};
const done = new Set(state.done.filter(index => Number.isInteger(index) && chapters[index]));
let visible;
let advanceTimer;

function save() {
  state.done = [...done];
  try {
    localStorage.setItem(key, JSON.stringify(state));
    storageAvailable = true;
  } catch {
    storageAvailable = false;
  }
}

function updateProgress(celebrate = false) {
  const count = done.size;
  document.querySelectorAll('[data-progress-count]').forEach(el => el.textContent = count + ' из ' + chapters.length);
  document.querySelectorAll('[data-progress]').forEach(el => {
    el.setAttribute('aria-valuenow', count);
    el.firstElementChild.style.width = count / chapters.length * 100 + '%';
    el.closest('.progress').classList.toggle('started', count > 0);
  });
  if (celebrate) {
    $('#progress-status').textContent = 'Раздел завершён. Прогресс: ' + count + ' из ' + chapters.length;
    document.querySelectorAll('.completion-star').forEach(star => {
      star.classList.remove('spark');
      void star.offsetWidth;
      star.classList.add('spark');
    });
  }
  document.querySelectorAll('[data-part-count]').forEach(el => {
    const part = parts[Number(el.dataset.partCount)];
    const complete = [...done].filter(index => index >= part.start && index < part.end).length;
    el.textContent = complete + ' из ' + (part.end - part.start) + ' разделов';
  });
  const pending = chapters.findIndex((_, index) => !done.has(index));
  const resume = chapters[state.current] && !done.has(state.current) ? state.current : pending;
  $('#start').href = pending < 0 ? '#final' : '#chapter-' + resume;
  $('#start').firstChild.textContent = pending < 0 ? 'Открыть финал ' : count || Object.values(state.answers).some(Boolean) ? 'Продолжить тетрадь ' : 'Открыть тетрадь ';
  $('#nav-work').href = '#chapter-' + (chapters[state.current] ? state.current : 0);
}

function renderNavigation(index) {
  $('#chapters').innerHTML = parts.map(part => '<p class="nav-heading">' + part.year + ' · ' + part.title + '</p>' +
    chapters.slice(part.start, part.end).map(([title], offset) => {
      const id = part.start + offset;
      return '<a href="#chapter-' + id + '"' + (id === index ? ' aria-current="page"' : '') + '>' + title +
        (done.has(id) ? '<span role="img" aria-label="Завершён">✦</span>' : '') + '</a>';
    }).join('')).join('');
  const picker = $('#chapters-mobile');
  picker.innerHTML = chapters.map(([title], id) => '<option value="' + id + '">' + (done.has(id) ? '✦ ' : '') + title + '</option>').join('');
  picker.value = index;
}

function renderExercise(index) {
  const [title, intro, prompts, defaultCount = 1] = chapters[index];
  const part = parts[index < 8 ? 0 : 1];
  const container = $('#exercise');
  container.innerHTML = '<div class="exercise-panel"><p class="eyebrow"><span></span>' + part.title + ' · ' + part.year +
    '</p><h1 tabindex="-1">' + title + '</h1>' + (intro ? '<p class="intro">' + intro + '</p>' : '') +
    '<div class="fields"></div><div class="progress exercise-progress">' +
    '<div class="progress-label"><span>Прогресс <span class="completion-star" aria-hidden="true">✦</span></span><strong data-progress-count></strong></div>' +
    '<div class="progress-track" data-progress role="progressbar" aria-label="Прогресс тетради" aria-valuemin="0" aria-valuemax="14"><div></div></div></div>' +
    '<div class="exercise-actions"></div><p class="save-note" aria-live="polite"></p></div>';
  const fields = container.querySelector('.fields');
  prompts.forEach((entry, position) => {
    const [prompt, repeats] = Array.isArray(entry) ? entry : [entry, defaultCount];
    const field = document.createElement(repeats > 1 ? 'fieldset' : 'div');
    field.className = 'field';
    const label = document.createElement(repeats > 1 ? 'legend' : 'label');
    label.textContent = prompt;
    field.append(label);
    if (index === 0) {
      field.classList.add("calendar-field");
      const guide = document.createElement('p');
      guide.className = 'field-guide';
      guide.id = 'calendar-guide';
      guide.textContent = calendarGuide;
      field.append(guide);
    }
    for (let n = 0; n < repeats; n++) {
      const fieldId = index + '-' + position + '-' + n;
      const input = document.createElement('textarea');
      input.id = 'field-' + fieldId;
      if (index === 0) input.setAttribute('aria-describedby', 'calendar-guide');
      input.value = state.answers[fieldId] ?? '';
      input.rows = repeats > 1 ? 1 : 3;
      input.placeholder = repeats > 1 ? (n + 1) + '. Напиши здесь…' : 'Напиши здесь…';
      if (repeats > 1) {
        input.className = 'short';
        input.setAttribute('aria-label', prompt + ' — ответ ' + (n + 1));
      } else {
        label.htmlFor = input.id;
      }
      input.addEventListener('input', () => {
        state.answers[fieldId] = input.value;
        if (input.value.trim()) {
          state.answerDates[fieldId] = new Date().toISOString();
        } else {
          delete state.answerDates[fieldId];
        }
        save();
        updateSaveNote();
      });
      field.append(input);
    }
    fields.append(field);
  });

  const actions = container.querySelector('.exercise-actions');
  const complete = document.createElement('button');
  complete.className = 'button primary';
  complete.textContent = done.has(index) ? 'Продолжить' : 'Завершить раздел';
  complete.addEventListener('click', () => {
    const isNew = !done.has(index);
    done.add(index);
    save();
    renderNavigation(index);
    updateProgress(isNew);
    updateSaveNote();
    const next = chapters.findIndex((_, id) => id > index && !done.has(id));
    const pending = next < 0 ? chapters.findIndex((_, id) => !done.has(id)) : next;
    const target = pending < 0 ? '#final' : '#chapter-' + (isNew ? pending : index < chapters.length - 1 ? index + 1 : pending);
    if (!isNew) {
      location.hash = target;
      return;
    }
    complete.disabled = true;
    complete.textContent = 'Раздел завершён ✦';
    const duration = matchMedia('(prefers-reduced-motion: reduce)').matches ? 90 : 1150;
    advanceTimer = setTimeout(() => location.hash = target, duration);
  });
  actions.append(complete);
  if (index > 0) {
    const back = document.createElement('a');
    back.className = 'button secondary';
    back.href = '#chapter-' + (index - 1);
    back.textContent = 'Предыдущий раздел';
    actions.append(back);
  }
  const download = document.createElement('button');
  download.className = 'button secondary exercise-pdf';
  download.type = 'button';
  download.dataset.download = '';
  download.textContent = 'Скачать PDF';
  actions.append(download);

  function updateSaveNote() {
    container.querySelector('.save-note').textContent = storageAvailable
      ? 'Ответы сохраняются в этом браузере.'
      : 'Браузер не сохранил ответы. Они доступны, пока открыта эта вкладка.';
  }
  updateSaveNote();
}

function route() {
  clearTimeout(advanceTimer);
  const hash = location.hash;
  const match = /^#chapter-(\d+)$/.exec(hash);
  const requested = match ? Number(match[1]) : null;
  const index = requested !== null && chapters[requested] ? requested : null;
  const final = hash === '#final' && done.size === chapters.length;
  if (hash === '#final' && !final) {
    location.replace('#chapter-' + chapters.findIndex((_, id) => !done.has(id)));
    return;
  }
  const view = final ? 'final' : index !== null ? 'workbook' : 'home';
  ['home','workbook','final'].forEach(id => $('#' + id).hidden = id !== view);
  $('#nav-home').toggleAttribute('aria-current', view === 'home');
  $('#nav-work').toggleAttribute('aria-current', view !== 'home');
  (view === 'home' ? $('#nav-home') : $('#nav-work')).setAttribute('aria-current', 'page');
  if (index !== null) {
    state.current = index;
    save();
    renderNavigation(index);
    renderExercise(index);
  }
  const stage = $('.final-stage');
  stage.classList.toggle('play', final);
  if (visible !== undefined || view !== 'home') {
    window.scrollTo(0, 0);
    if (index !== null) $('#exercise h1').focus({preventScroll:true});
    if (final) $('#final-title').focus({preventScroll:true});
  }
  visible = view;
  updateProgress();
}

$('#parts').innerHTML = parts.map((part,index) =>
  '<a class="part" href="#chapter-' + part.start + '"><span class="eyebrow">' + part.year +
  '</span><span class="part-icon" aria-hidden="true">' + part.icon + '</span><h3>' + part.title +
  '</h3><p data-part-count="' + index + '"></p></a>').join('');
$('#chapters-mobile').addEventListener('change', event => location.hash = '#chapter-' + event.target.value);
window.addEventListener('hashchange', route);
route();

const pdfDate = new Intl.DateTimeFormat('ru-RU', {
  dateStyle:'long',
  timeZone:'Europe/Moscow'
});

function workbookPdf(answers, completed, answerDates, coverImage, exportedAt = new Date()) {
  const answerDays = Object.entries(answerDates)
    .filter(([key, date]) => answers[key]?.trim() && Number.isFinite(Date.parse(date)))
    .map(([, date]) => new Date(date))
    .sort((a, b) => a - b);
  const firstDay = answerDays.length ? pdfDate.format(answerDays[0]) : '';
  const lastDay = answerDays.length ? pdfDate.format(answerDays.at(-1)) : '';
  const content = [
    {text:'РАБОЧАЯ ТЕТРАДЬ',style:'coverLabel'},
    {text:'Годовой Компас',style:'coverTitle'},
    {text:'Итоги 2026 года и планы на 2027',style:'coverSubtitle'}
  ];
  if (coverImage) {
    content.push({image:coverImage,fit:[495,440],alignment:'center',margin:[0,0,0,24]});
  }
  if (firstDay) {
    content.push({text:'Даты ответов: ' + (firstDay === lastDay ? firstDay : firstDay + ' — ' + lastDay),style:'coverLabel'});
  }
  content.push(
    {text:'Разделы завершены: ' + completed.size + ' из ' + chapters.length,style:'coverLabel'},
    {text:'Дата выгрузки: ' + pdfDate.format(exportedAt),style:'coverLabel'}
  );

  chapters.forEach(([title, intro, prompts, defaultCount = 1], index) => {
    const part = parts[index < parts[1].start ? 0 : 1];
    content.push({
      text:part.title + ' · ' + part.year + (completed.has(index) ? '   /   Раздел завершён' : ''),
      style:'part',
      pageBreak:'before'
    }, {text:title,style:'heading'});
    if (intro) content.push({text:intro,style:'intro'});
    prompts.forEach((entry, position) => {
      const [prompt, count] = Array.isArray(entry) ? entry : [entry, defaultCount];
      content.push({text:prompt,style:'prompt',headlineLevel:1});
      if (index === 0) content.push({text:calendarGuide,style:'intro'});
      for (let n = 0; n < count; n++) {
        const key = index + '-' + position + '-' + n;
        const answer = answers[key];
        const prefix = count > 1 ? (n + 1) + '. ' : '';
        if (answer?.trim()) {
          const timestamp = Date.parse(answerDates[key]);
          const date = Number.isFinite(timestamp) ? pdfDate.format(timestamp) : 'дата записи не сохранена';
          content.push({text:prefix + date,style:'answerDate',headlineLevel:1});
          content.push({text:answer,style:'answer'});
        } else {
          content.push({text:prefix + '—',style:'answer'});
        }
      }
    });
  });

  if (completed.size === chapters.length) {
    content.push(
      {text:'Ты выбрал(а) направление.',style:'heading',pageBreak:'before'},
      {text:'Ты подвёл(а) итоги. Ты увидел(а) путь.',style:'intro'},
      {text:'Сделай глубокий вдох. Поблагодари себя.\nТы готов(а) идти дальше.',style:'answer'}
    );
  }

  return {
    info:{title:'Годовой Компас · 2026–2027'},
    pageSize:'A4',
    pageMargins:[46,44,46,51],
    background:(_, size) => ({
      canvas:[{type:'rect',x:0,y:0,w:size.width,h:size.height,color:'#FFE9CF'}]
    }),
    footer:(page, total) => ({
      columns:[{text:'Годовой Компас'},{text:page + ' / ' + total,alignment:'right'}],
      margin:[46,15,46,0],
      color:'#765548',
      fontSize:9
    }),
    pageBreakBefore:(node, following) => node.headlineLevel === 1 && following.length === 0,
    defaultStyle:{font:'Roboto',fontSize:11,color:'#372019',lineHeight:1.22},
    styles:{
      coverLabel:{alignment:'center',fontSize:11,color:'#813c33',margin:[0,0,0,8]},
      coverTitle:{alignment:'center',fontSize:36,bold:true,margin:[0,0,0,8]},
      coverSubtitle:{alignment:'center',fontSize:14,color:'#813c33',margin:[0,0,0,25]},
      part:{fontSize:10,bold:true,color:'#813c33',margin:[0,0,0,8]},
      heading:{fontSize:26,bold:true,margin:[0,0,0,16]},
      intro:{color:'#68493d',margin:[0,0,0,12]},
      prompt:{bold:true,margin:[0,12,0,5]},
      answerDate:{fontSize:9,color:'#813c33',margin:[0,0,0,3]},
      answer:{margin:[0,0,0,8]}
    },
    content
  };
}

function loadPdfScript(source) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = source;
    script.onload = resolve;
    script.onerror = () => {
      script.remove();
      reject(new Error('PDF library failed to load'));
    };
    document.head.append(script);
  });
}

async function loadPdfCover() {
  const response = await fetch('./assets/compass-print.jpg');
  if (!response.ok) throw new Error('PDF cover failed to load');
  const image = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(image);
  });
}

let pdfReady;
let downloading = false;
document.addEventListener('click', async event => {
  const button = event.target.closest('[data-download]');
  if (!button || downloading) return;
  downloading = true;
  button.disabled = true;
  button.textContent = 'Готовим PDF…';
  const status = $('#download-status');
  status.hidden = true;
  status.textContent = '';
  try {
    if (!pdfReady) {
      pdfReady = (async () => {
        const cover = loadPdfCover();
        const library = async () => {
          if (!window.pdfMake) await loadPdfScript('./vendor/pdfmake.min.js');
          await loadPdfScript('./vendor/vfs_fonts.js');
        };
        const [image] = await Promise.all([cover, library()]);
        return image;
      })().catch(error => {
        pdfReady = undefined;
        throw error;
      });
    }
    const coverImage = await pdfReady;
    const pdf = window.pdfMake.createPdf(workbookPdf(state.answers, done, state.answerDates, coverImage));
    const blob = await new Promise(resolve => pdf.getBlob(resolve));
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Годовой Компас — мои ответы.pdf';
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  } catch {
    status.textContent = 'Не удалось подготовить PDF. Попробуй скачать ещё раз.';
    status.hidden = false;
  } finally {
    downloading = false;
    button.disabled = false;
    button.textContent = 'Скачать PDF';
  }
});
