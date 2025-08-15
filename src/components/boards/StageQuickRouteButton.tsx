import React from 'react';
import { Route } from 'lucide-react';
import { WorkflowStage, AutomationConfig } from '../../types';

interface Props {
    stage: WorkflowStage;
    onOpenEditor: (preset?: AutomationConfig) => void;
}

/** Кнопка: быстро задать createLinkedTask c mirrorBack */
const StageQuickRouteButton: React.FC<Props> = ({ stage, onOpenEditor }) => {
    const handleClick = () => {
        const preset: AutomationConfig = {
            actions: [
                {
                    type: 'createLinkedTask',
                    // >>> ВАЖНО: эти две строки пользователь потом изменит в редакторе
                    targetBoardKey: 'QA',            // куда посылать
                    targetStageKey: 'todo',          // сразу в какую колонку на целевой доске
                    linkType: 'DEPENDS_ON',
                    titleTpl: 'QA: ${title}',
                    descriptionTpl: 'Origin: ${id}\n\n${description}',
                    inheritAssignee: false,
                    autoCreateBoardIfMissing: true,
                    seedStages: [
                        { key: 'todo', name: 'To Do', order: 1 },
                        { key: 'doing', name: 'In Progress', order: 2 },
                        { key: 'done', name: 'Done', order: 3 },
                    ],
                    mirrorBack: {
                        // когда на целевой доске дошли до done:
                        onStageKey: 'done',
                        // двинуть исходную задачу на этой доске в stage "TESTED" (замени на свой)
                        moveOriginToStageKey: 'TESTED',
                        postCommentTpl: 'QA завершил проверку: ${title}\n\n${description}',
                        copyFields: ['description'],
                        autoDeploy: false,
                    },
                },
            ],
        };
        onOpenEditor(preset);
    };

    return (
        <button
            title="Быстрая маршрутизация"
            onClick={handleClick}
            className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
        >
            <Route className="h-4 w-4" />
        </button>
    );
};

export default StageQuickRouteButton;
