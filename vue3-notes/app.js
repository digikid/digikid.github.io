const uid = () => {
    const chr4 = () => Math.random().toString(16).slice(-4);

    return chr4() + chr4() + '-' + chr4() + '-' + chr4() + '-' + chr4() + '-' + chr4() + chr4() + chr4();
};

const formatIndex = num => (num > 9) ? num : `0${num}`;

const getDate = (days = 0) => {
    const now = new Date();
    const date = new Date(now.setDate(now.getDate() - days));

    const y = date.getFullYear();
    const m = formatIndex(date.getMonth() + 1);
    const d = formatIndex(date.getDate());

    return `${y}-${m}-${d}`;
};

const getNotes = (count = 5) => {
    const texts = [
        'Repudiandae mollitia assumenda, fuga esse libero eveniet nobis maxime aperiam a, corporis ea officiis natus, quod fugit quia eligendi aliquid inventore, dolore! Consequatur ipsam quia labore ad dolores, natus voluptatum possimus pariatur nemo quae necessitatibus quibusdam saepe, sunt non velit eveniet, eum recusandae eos tempora. Tempore sit tenetur iure, recusandae!',
        'Perferendis labore quam, minima distinctio optio ipsa fuga. Porro a quaerat consectetur esse neque laboriosam aliquam iure ratione, sapiente autem, est, at cumque officia distinctio fugit aliquid excepturi! Tempore, maxime. Minus illum obcaecati et harum, accusamus tempore minima porro iusto. Soluta pariatur impedit repellat obcaecati quasi doloremque ex omnis ratione.',
        'Porro id, quia adipisci vel consequuntur necessitatibus ipsum sequi voluptates, accusantium inventore numquam quibusdam tenetur itaque sunt. Omnis, temporibus facere ipsum est sint, facilis esse et, beatae ex aspernatur dolores accusantium vitae laborum earum! Nihil dolores vitae, ipsam. Ut accusamus dolorum quas labore, incidunt consectetur excepturi, voluptatibus nobis sint ab.',
        'Delectus pariatur, ad cumque laborum asperiores, nobis soluta earum repellat consequuntur fugiat consequatur dolor. Delectus, quae impedit. Nulla quos maiores velit commodi, obcaecati dicta eos, ut earum, quibusdam hic assumenda quidem. Omnis recusandae est eos adipisci. Eius fugit dicta corporis repellat quidem error velit aliquam, nemo quasi sunt, repellendus sint.',
        'Eos vitae laudantium dolores ullam, iste quisquam et tenetur ipsa sequi ea ut eum impedit, eius aliquam, dolor incidunt, aut vel exercitationem officiis in mollitia praesentium molestiae voluptatum provident atque. Dolorem, labore iste aspernatur inventore laboriosam ut aperiam rerum, explicabo vitae omnis magnam voluptatibus exercitationem autem vel placeat corrupti laudantium.'
    ];

    return [...new Array(count)].map((_, i) => {
        const id = uid();
        const date = getDate(count - i);
        const text = texts[(i > texts.length - 1) ? (i % texts.length) : i];

        return {
            id,
            date,
            text
        };
    });
};

const isCmdEnter = e => (e.ctrlKey || e.metaKey) && event.keyCode == 13;

const App = {
    data() {
        return {
            isInited: false,
            isSettingsActive: false,
            title: 'Vue3 Notes',
            notes: [],
            settings: {
                enableEdit: false,
                enableClickEdit: false,
                orderByDate: false,
                darkMode: false
            },
            textarea: {
                value: '',
                placeholder: 'О чем вы хотите написать?'
            },
            editor: {
                id: null,
                text: null
            }
        }
    },
    mounted() {
        this.onAppMounted();

        this.isInited = true;
    },
    computed: {
        orderedNotes() {
            const order = this.settings.orderByDate;
            const notes = order ? this.notes : [...this.notes].reverse();

            return notes.map((note, i) => {
                const index = order ? (i + 1) : (this.notes.length - i);

                return {
                    ...note,
                    title: `Заметка #${index}`
                };
            });
        }
    },
    methods: {
        onAppMounted() {
            const notes = getNotes();
            const localNotes = localStorage.getItem('APP_NOTES');
            const localSettings = localStorage.getItem('APP_SETTINGS');

            if (!localNotes || !JSON.parse(localNotes).length) {
                localStorage.setItem('APP_NOTES', JSON.stringify(notes));

                this.notes = notes;
            } else {
                this.notes = JSON.parse(localNotes);
            };

            if (localSettings) {
                this.settings = JSON.parse(localSettings);
            };

            document.addEventListener('click', ({ target }) => {
                this.isSettingsActive = false;
                this.editor.id = null;
                this.editor.text = null;
            });
        },
        onLocalStorageReset() {
            localStorage.removeItem('APP_NOTES');
            localStorage.removeItem('APP_SETTINGS');

            this.reload();
        },
        onSettingsToggle() {
            this.isSettingsActive = !this.isSettingsActive;
        },
        onSubmit() {
            const id = uid();
            const date = getDate();
            const index = this.notes.length ? (this.notes.length + 1) : 1;
            const title = `Заметка #${index}`;
            const text = this.textarea.value.trim();

            this.notes.push({
                id,
                date,
                title,
                text
            });

            this.textarea.value = '';
        },
        onRemove(id) {
            const index = this.notes.findIndex(note => note.id === id);

            if (index > -1) {
                this.notes.splice(index, 1);
            };
        },
        onEdit(id) {
            const note = this.notes.find(note => note.id === id);

            if (note) {
                this.editor.id = note.id;
                this.editor.text = note.text;
            };

            this.isSettingsActive = false;
        },
        onSave(id) {
            const index = this.notes.findIndex(note => note.id === id);

            if (index > -1) {
                this.notes[index].text = this.editor.text;
            };

            this.editor.id = null;
            this.editor.text = null;
        },
        onNoteClick(id) {
            this.isSettingsActive = false;

            if (this.settings.enableClickEdit) {
                this.onEdit(id);
            };
        },
        onCreateKeydown(e) {
            if (!isCmdEnter(e)) return;

            this.onSubmit();
        },
        onEditKeydown(e, id) {
            if (!isCmdEnter(e)) return;

            this.onSave(id);
        },
        reload() {
            location.reload();
        }
    },
    watch: {
        settings: {
            handler(value) {
                const { classList: bodyClassList } = document.body;

                localStorage.setItem('APP_SETTINGS', JSON.stringify(value));

                if (!value.enableEdit && !value.enableClickEdit) {
                    this.editor.id = null;
                    this.editor.text = null;
                };

                if (value.darkMode) {
                    bodyClassList.add('dark-mode');
                } else {
                    bodyClassList.remove('dark-mode');
                };
            },
            deep: true
        },
        notes: {
            handler(value) {
                localStorage.setItem('APP_NOTES', JSON.stringify(value));
            },
            deep: true
        }
    }
};

Vue.createApp(App).mount('#app');